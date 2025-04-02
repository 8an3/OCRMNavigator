import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NavigatorItem, NavigatorConfig, NavigatorCategoryItem, NavigatorQuickPickItem } from './interface';
import * as os from 'os';
import { getMarkdownGuideContent } from './markdownguid'
import { getCommandsWebviewContent } from './getCommandsWebviewContent';
import { selectFolder as selectFolderImport } from './selectFolder'
import { updateFolderExpansion } from './updateFolderExpansion';

export function registerCommands(context:any, dependencies: any) {
    const { vscode, itemToMove, workspaceRoot, configPath, navigatorProvider } = dependencies;
        // DRAG AND DROP 
        vscode.commands.registerCommand('ocrmnavigator.moveItem', (item: NavigatorItem) => { itemToMove = item; vscode.window.showInformationMessage(`Selected "${item.label}" to move. Now select destination folder.`); }),
        vscode.commands.registerCommand('ocrmnavigator.setMoveTarget', async (parentItem: NavigatorItem) => {
            if (!itemToMove) { vscode.window.showErrorMessage('No item selected to move'); return; }
            const item = itemToMove;
            try {
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig
                let itemRemoved = false;
                for (const category of config.categories) {
                    const itemIndex = category.items?.findIndex(existingItem => {
                        if (item.type === 'file' || item.type === 'url' || item.type === 'folder') {
                            return existingItem.path &&
                                path.join(workspaceRoot, existingItem.path) === item.filePath;
                        }
                        return existingItem.path === item.filePath ||
                            existingItem.cmd === item.cmd;
                    }) ?? -1;

                    if (itemIndex >= 0) {
                        category.items?.splice(itemIndex, 1);
                        itemRemoved = true;

                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                        vscode.window.showInformationMessage(`Removed "${item.label}" from navigator`);
                        break;
                    }
                }

                if (!itemRemoved) { vscode.window.showWarningMessage('Could not find original item in config'); }

                const parentCategory = config.categories.find(c => c.label === parentItem.label);
                if (!parentCategory) {
                    vscode.window.showErrorMessage('Parent category not found');
                    return;
                }
                const previousPath = item.filePath || item.path || '';
                const fileName = path.basename(previousPath);
                const pathOrUrl = path.relative(workspaceRoot, previousPath)

                vscode.window.showInformationMessage(`previousPath: ${previousPath} fileName: ${fileName} pathOrUrl: ${pathOrUrl}`);
                vscode.window.showInformationMessage(`Item to move: ${JSON.stringify(item, null, 2)}`);
                // Create new subcategory
                const newSubcategory: NavigatorItem = {
                    label: item.label,
                    type: item.type === 'url' ? 'url' :
                        item.type === 'folder' ? 'folder' :
                            'file',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    path: item.type === 'url' ? item.filePath : pathOrUrl,
                    filePath: item.type === 'url' ? item.filePath : pathOrUrl
                };

                parentCategory.items.push(newSubcategory);

                // Save changes
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Moved "${item.label}" from "${parentCategory.label}"`);
                itemToMove = null;
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to move item: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),


        // CONFIG
        vscode.commands.registerCommand('ocrmnavigator.exportConfig', async () => {
            try {
                if (!workspaceRoot) { vscode.window.showErrorMessage('No workspace folder open'); return; }
                const targetPath = path.join(workspaceRoot, 'navigator-config.json');

                if (fs.existsSync(targetPath)) {
                    const overwrite = await vscode.window.showQuickPick(['Overwrite', 'Cancel'], { placeHolder: 'Config file already exists in workspace. Overwrite?' });

                    if (overwrite !== 'Overwrite') { return; }
                }

                // Copy config file
                fs.copyFileSync(configPath, targetPath);
                vscode.window.showInformationMessage(`Config exported to ${targetPath}`);

                // Open the exported file
                const doc = await vscode.workspace.openTextDocument(targetPath);
                await vscode.window.showTextDocument(doc);
            } catch (error) { vscode.window.showErrorMessage(`Export failed: ${error instanceof Error ? error.message : String(error)}`); }
        }),
        vscode.commands.registerCommand('ocrmnavigator.importConfig', async () => {
            try {
                const fileUris = await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    openLabel: 'Import',
                    filters: { 'JSON Files': ['json'] }
                });

                if (!fileUris || fileUris.length === 0) { return; }

                const sourcePath = fileUris[0].fsPath;
                let content = fs.readFileSync(sourcePath, 'utf8');

                // Fix trailing commas in the JSON content
                content = fixTrailingCommas(content);

                // Validate JSON after fixing
                try {
                    JSON.parse(content);
                } catch (jsonError) {
                    vscode.window.showErrorMessage(`Invalid JSON file: ${jsonError.message}`);
                    return;
                }

                // Backup current config
                if (fs.existsSync(configPath)) {
                    const backupPath = configPath + '.bak';
                    fs.copyFileSync(configPath, backupPath);
                }

                // Write the fixed content to the config path
                fs.writeFileSync(configPath, content, 'utf8');

                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage('Config imported successfully! (Trailing commas were automatically fixed if present)');
            } catch (error) {
                vscode.window.showErrorMessage(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.editConfig', async () => {
            try {
                // Ensure config file exists
                if (!fs.existsSync(configPath)) {
                    vscode.window.showWarningMessage('Config file not found, creating new one');
                    fs.writeFileSync(configPath, JSON.stringify({ categories: [] }, null, 2));
                }

                // Open the document
                const doc = await vscode.workspace.openTextDocument(configPath);
                await vscode.window.showTextDocument(doc);

                // Set up auto-refresh when saved
                const disposable = vscode.workspace.onDidSaveTextDocument((savedDoc: any) => {
                    if (savedDoc.uri.fsPath === configPath) {
                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                        vscode.window.showInformationMessage('Navigator updated with new config');
                    }
                });

                context.subscriptions.push(disposable);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to edit config: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),


        // REFRESH
        vscode.commands.registerCommand('ocrmnavigator.refreshNavigator', () => {
            vscode.commands.executeCommand('ocrmnavigator.refresh');
            vscode.window.showInformationMessage('Navigator refreshed');
        }),
        vscode.commands.registerCommand('ocrmnavigator.refresh', () => {
            navigatorProvider.refresh();
            navigatorProvider.loadConfig();
        }),


        // FILE
        vscode.commands.registerCommand('ocrmnavigator.initialFile', (item: NavigatorItem) => {
            if (item.length > 1) {
                vscode.commands.executeCommand('ocrmnavigator.addFilesToNavigator', clickedUri,selectedUris);
            } else {
                vscode.commands.executeCommand('ocrmnavigator.addFileToNavigator', fileUri);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.revealInExplorer', (item: NavigatorItem) => {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(item.filePath));
        }),
        vscode.commands.registerCommand('ocrmnavigator.copyPath', (item: NavigatorItem) => {
            vscode.env.clipboard.writeText(item.filePath);
            vscode.window.showInformationMessage('Path copied to clipboard');
        }),
        vscode.commands.registerCommand('ocrmnavigator.addFileToNavigator', async (fileUri: vscode.Uri) => {
            try {
                // If no URI was provided, try to get currently active file
                if (!fileUri) {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        fileUri = editor.document.uri;
                    } else {
                        vscode.window.showErrorMessage('No file selected');
                        return;
                    }
                }

                // Check if file exists
                if (!fs.existsSync(fileUri.fsPath)) {
                    vscode.window.showErrorMessage(`File not found: ${fileUri.fsPath}`);
                    return;
                }

                // Calculate relative path from workspace
                const relativePath = path.relative(workspaceRoot, fileUri.fsPath);

                // Get custom label for the file
                const fileName = path.basename(fileUri.fsPath);
                const userLabel = await vscode.window.showInputBox({
                    prompt: 'Enter a label for this file',
                    placeHolder: 'e.g. Dashboard Component',
                    value: fileName
                });

                if (!userLabel) {
                    return; // User cancelled
                }

                // After getting userLabel, ask if this is a file or URL
                const itemType = await vscode.window.showQuickPick(
                    ['File', 'URL'],
                    { placeHolder: 'Is this a file or web URL?' }
                );

                if (!itemType) return;

                let pathOrUrl: string;
                if (itemType === 'URL') {
                    const url = await vscode.window.showInputBox({
                        prompt: 'Enter the web URL',
                        placeHolder: 'https://example.com'
                    });
                    if (!url) return;
                    pathOrUrl = url;
                } else {
                    pathOrUrl = path.relative(workspaceRoot, fileUri.fsPath);
                }

                // create / select folder
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;
                const folderSelection = await selectFolderImport(config);
                if (!folderSelection) return;

                // Add the new item
                folderSelection.targetItems.push({
                    label: userLabel,
                    path: pathOrUrl,
                    type: itemType === 'URL' ? 'url' : 'file',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: pathOrUrl
                });

                // Save updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Added "${userLabel}" to ${folderSelection.location}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),

        vscode.commands.registerCommand('ocrmnavigator.editFileLabel', async (item: NavigatorItem) => {
            if (!item) { return; }
            if (item.type === 'snippet' || item.type === 'md') { return; }

            try {
                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find the file in the config
                let fileFound = false;
                for (const category of config.categories) {
                    // Skip categories without items array
                    if (!category.items) {
                        continue;
                    }

                    const fileIndex = category.items?.findIndex(
                        fileItem => fileItem.path && path.join(workspaceRoot, fileItem.path) === item.filePath
                    );

                    if (fileIndex >= 0) {
                        // Ask for new label
                        const currentLabel = category.items[fileIndex].label;
                        const newLabel = await vscode.window.showInputBox({
                            prompt: 'Enter new label for this file',
                            placeHolder: 'e.g. Dashboard Component',
                            value: currentLabel
                        });

                        if (newLabel && newLabel !== currentLabel) {
                            // Update label
                            category.items[fileIndex].label = newLabel;

                            // Save config
                            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                            vscode.commands.executeCommand('ocrmnavigator.refresh');
                            vscode.window.showInformationMessage(`Renamed to "${newLabel}"`);
                        }

                        fileFound = true;
                        break;
                    }
                }

                if (!fileFound) {
                    vscode.window.showWarningMessage('File not found in navigator configuration');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to rename file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.deleteItem', async (item: NavigatorItem) => {
            if (!item) { return; }
            if (item.type !== 'snippet' && item.type !== 'md' && item.type !== 'folder') { return; }

            try {
                // Confirm deletion
                const confirmed = await vscode.window.showWarningMessage(
                    `Remove "${item.label}" from navigator?`,
                    { modal: true },
                    'Remove'
                );

                if (confirmed !== 'Remove') {
                    return;
                }

                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find and remove the item
                let itemRemoved = false;

                // Loop through categories instead of folders
                for (const category of config.categories) {
                    const itemIndex = category.items.findIndex((existingItem: NavigatorItem) => {
                        // For files, compare paths and labels for better matching
                        if (item.type === 'file' || item.type === 'url') {
                            return existingItem.path === item.path &&
                                existingItem.label === item.label &&
                                existingItem.type === item.type;
                        }
                        // For commands
                        return existingItem.cmd === item.cmd;
                    });

                    if (itemIndex >= 0) {
                        // Remove item
                        category.items.splice(itemIndex, 1);
                        itemRemoved = true;

                        // Save config
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                        vscode.window.showInformationMessage(`Removed "${item.label}" from navigator`);
                        break;
                    }
                }

                if (!itemRemoved) {
                    vscode.window.showWarningMessage('Item not found in navigator configuration');
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to remove item: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.moveFileUp', async (item: NavigatorItem) => {
            try {
                // Load the current configuration
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find the item and its parent in configuration
                const result = findItemInConfig(config, item);

                if (!result) {
                    vscode.window.showErrorMessage('Cannot find the item in configuration');
                    return;
                }

                const { parentCategory, itemIndex, itemsArray } = result;

                // Check if the item is already at the top
                if (itemIndex === 0) {
                    vscode.window.showInformationMessage('Item is already at the top');
                    return;
                }

                // Swap with the item above it
                [itemsArray[itemIndex], itemsArray[itemIndex - 1]] =
                    [itemsArray[itemIndex - 1], itemsArray[itemIndex]];

                // Save updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Moved "${item.label}" up`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to move file up: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.moveFileDown', async (item: NavigatorItem) => {
            try {
                // Load the current configuration
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find the item and its parent in configuration
                const result = findItemInConfig(config, item);

                if (!result) {
                    vscode.window.showErrorMessage('Cannot find the item in configuration');
                    return;
                }

                const { parentCategory, itemIndex, itemsArray } = result;

                // Check if the item is already at the bottom
                if (itemIndex === itemsArray.length - 1) {
                    vscode.window.showInformationMessage('Item is already at the bottom');
                    return;
                }

                // Swap with the item below it
                [itemsArray[itemIndex], itemsArray[itemIndex + 1]] =
                    [itemsArray[itemIndex + 1], itemsArray[itemIndex]];

                // Save updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                // Refresh the view
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Moved "${item.label}" down`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to move file down: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.addFileToSelectedFolder', async (folderItem: NavigatorItem, fileUri?: vscode.Uri) => {
            try {
                // Verify we have a folder
                if (!folderItem || folderItem.type !== 'folder') {
                    vscode.window.showErrorMessage('Please select a category/folder first');
                    return;
                }

                // If no URI was provided, try to get currently active file
                if (!fileUri) {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        fileUri = editor.document.uri;
                    } else {
                        // If no active editor, prompt user to select a file
                        const files = await vscode.window.showOpenDialog({
                            canSelectMany: false,
                            openLabel: 'Select File',
                            filters: { 'All Files': ['*'] }
                        });

                        if (!files || files.length === 0) {
                            vscode.window.showErrorMessage('No file selected');
                            return;
                        }

                        fileUri = files[0];
                    }
                }

                // Check if file exists
                if (!fs.existsSync(fileUri.fsPath)) {
                    vscode.window.showErrorMessage(`File not found: ${fileUri.fsPath}`);
                    return;
                }

                // Calculate relative path from workspace
                const relativePath = path.relative(workspaceRoot, fileUri.fsPath);

                // Get custom label for the file
                const fileName = path.basename(fileUri.fsPath);
                const userLabel = await vscode.window.showInputBox({
                    prompt: 'Enter a label for this file',
                    placeHolder: 'e.g. Dashboard Component',
                    value: fileName
                });

                if (!userLabel) {
                    return; // User cancelled
                }

                // After getting userLabel, ask if this is a file or URL
                const itemType = await vscode.window.showQuickPick(
                    ['File', 'URL'],
                    { placeHolder: 'Is this a file or web URL?' }
                );

                if (!itemType) return;

                let pathOrUrl: string;
                if (itemType === 'URL') {
                    const url = await vscode.window.showInputBox({
                        prompt: 'Enter the web URL',
                        placeHolder: 'https://example.com'
                    });
                    if (!url) return;
                    pathOrUrl = url;
                } else {
                    pathOrUrl = path.relative(workspaceRoot, fileUri.fsPath);
                }

                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find the selected folder in the config
                const selectedFolderLabel = folderItem.label;
                let targetCategory: NavigatorCategoryItem | undefined;

                // Look for the folder in categories
                targetCategory = config.categories.find(category => category.label === selectedFolderLabel);

                if (!targetCategory) {
                    // Folder wasn't found at the top level, so it might be a subcategory
                    for (const category of config.categories) {
                        const subcategory = category.items.find(item =>
                            item.type === 'folder' && item.label === selectedFolderLabel
                        ) as NavigatorCategoryItem | undefined;

                        if (subcategory) {
                            targetCategory = subcategory;
                            break;
                        }
                    }
                }

                if (!targetCategory) {
                    vscode.window.showErrorMessage(`Couldn't find the selected folder "${selectedFolderLabel}" in configuration`);
                    return;
                }

                // Add the new item to the selected folder
                targetCategory.items.push({
                    label: userLabel,
                    path: pathOrUrl,
                    type: itemType === 'URL' ? 'url' : 'file',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: pathOrUrl
                });

                // Save updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Added "${userLabel}" to "${selectedFolderLabel}"`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.renameBatch', async (uri: vscode.Uri, selectedUris: vscode.Uri[]) => {
            try {
                // Handle both single and multi-selection
                const urisToRename: vscode.Uri[] = selectedUris || (uri ? [uri] : []);

                if (urisToRename.length === 0) {
                    vscode.window.showErrorMessage('Please select one or more files to rename');
                    return;
                }

                // Sort the URIs to ensure consistent order
                urisToRename.sort((a, b) => a.fsPath.localeCompare(b.fsPath));

                // Get current file names
                const currentFileNames = urisToRename.map(uri => path.basename(uri.fsPath));

                // Create a temporary file with the current file names
                const tempDir = os.tmpdir();
                const tempFilePath = path.join(tempDir, `batch-rename-${Date.now()}.txt`);

                // Write the current file names to the temp file
                fs.writeFileSync(tempFilePath, currentFileNames.join('\n'), 'utf8');

                // Flag to track if rename has been executed
                let renameExecuted = false;

                // Function to perform the rename operation
                const performRename = async () => {
                    if (renameExecuted) return; // Prevent multiple executions
                    renameExecuted = true;

                    try {
                        // Read the current content directly from the file system
                        // (more reliable than using vscode.workspace.openTextDocument)
                        const editedContent = fs.readFileSync(tempFilePath, 'utf8');
                        const newNames = editedContent.split('\n').map(name => name.trim()).filter(name => name !== '');

                        // Validate names
                        if (newNames.length !== urisToRename.length) {
                            vscode.window.showErrorMessage(
                                `Number of names (${newNames.length}) doesn't match number of files (${urisToRename.length})`
                            );
                            renameExecuted = false; // Reset flag to allow trying again
                            return;
                        }

                        // Rename files
                        let filesRenamed = 0;
                        for (let i = 0; i < urisToRename.length; i++) {
                            const uri = urisToRename[i];
                            const oldName = path.basename(uri.fsPath);
                            const newName = newNames[i];

                            if (newName && newName !== oldName) {
                                const dirName = path.dirname(uri.fsPath);
                                const newPath = path.join(dirName, newName);
                                const newUri = vscode.Uri.file(newPath);

                                try {
                                    await vscode.workspace.fs.rename(uri, newUri, { overwrite: false });
                                    filesRenamed++;
                                } catch (err) {
                                    vscode.window.showErrorMessage(`Failed to rename "${oldName}" to "${newName}": ${err instanceof Error ? err.message : String(err)}`);
                                }
                            }
                        }

                        if (filesRenamed > 0) {
                            vscode.window.showInformationMessage(`Renamed ${filesRenamed} files`);
                        } else {
                            vscode.window.showInformationMessage('No files were renamed');
                        }

                        // Clean up resources
                        cleanup();
                    } catch (error) {
                        vscode.window.showErrorMessage(
                            `Failed to process renamed files: ${error instanceof Error ? error.message : String(error)}`
                        );
                        renameExecuted = false; // Reset flag to allow trying again
                    }
                };

                // Function to clean up resources
                const cleanup = () => {
                    // Clean up the temp file
                    try {
                        fs.unlinkSync(tempFilePath);
                    } catch (err) {
                        console.error('Error deleting temp file:', err);
                    }

                    // Dispose of all event listeners
                    textDocumentChangeDisposable.dispose();
                    closeDisposable.dispose();
                    applyCommand.dispose();
                };

                // Register the apply command
                const applyCommand = vscode.commands.registerCommand('ocrmnavigator.applyBatchRename', performRename);

                // Track the document version to detect changes
                let lastVersion = -1;
                let documentSaved = false;

                // Watch for document changes and track when it's saved
                const textDocumentChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
                    if (event.document.uri.fsPath === tempFilePath) {
                        lastVersion = event.document.version;
                        documentSaved = false;
                    }
                });

                // Watch specifically for textDocument save
                vscode.workspace.onDidSaveTextDocument((document) => {
                    if (document.uri.fsPath === tempFilePath) {
                        documentSaved = true;
                        lastVersion = document.version;

                        // Use a short timeout to ensure the file is fully written
                        setTimeout(() => {
                            performRename();
                        }, 100);
                    }
                });

                // Watch for document close
                const closeDisposable = vscode.workspace.onDidCloseTextDocument((closedDoc) => {
                    if (closedDoc.uri.fsPath === tempFilePath && documentSaved) {
                        // Only trigger rename if the document was saved
                        setTimeout(() => {
                            performRename();
                        }, 100);
                    }
                });

                // Save all disposables in context subscriptions
                context.subscriptions.push(applyCommand, textDocumentChangeDisposable, closeDisposable);

                // Open the file in the editor
                const document = await vscode.workspace.openTextDocument(tempFilePath);
                await vscode.window.showTextDocument(document);

                // Show message with explicit apply button
                vscode.window.showInformationMessage(
                    'Edit the file names, then save/close the file or click "Apply Rename" to complete the process.',
                    { modal: false },
                    'Apply Rename'
                ).then(selection => {
                    if (selection === 'Apply Rename') {
                        vscode.commands.executeCommand('ocrmnavigator.applyBatchRename');
                    }
                });

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to batch rename: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.addFilesToNavigator', async (clickedUri: vscode.Uri, selectedUris: vscode.Uri[]) => {
            try {
                // Debug selections
                console.log('Clicked URI:', clickedUri?.fsPath);
                console.log('Selected URIs:', selectedUris?.map(u => u.fsPath));

                // Handle both single and multiple selection properly
                const fileUris = selectedUris?.length > 0 ? selectedUris : clickedUri ? [clickedUri] : [];

                // Fallback to active editor if nothing selected
                if (fileUris.length === 0) {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        fileUris.push(editor.document.uri);
                    } else {
                        vscode.window.showErrorMessage('No files selected');
                        return;
                    }
                }

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Select destination folder
                const folderSelection = await selectFolderImport(config);
                if (!folderSelection) return;

                // Process each file
                let addedCount = 0;
                for (const fileUri of fileUris) {
                    if (!fs.existsSync(fileUri.fsPath)) {
                        vscode.window.showWarningMessage(`Skipping - File not found: ${fileUri.fsPath}`);
                        continue;
                    }

                    const fileName = path.basename(fileUri.fsPath);
                    const label = fileName.replace(/\.[^/.]+$/, "");
                    const relativePath = path.relative(workspaceRoot, fileUri.fsPath);

                    folderSelection.targetItems.push({
                        label: label,
                        path: relativePath,
                        type: 'file',
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        filePath: relativePath
                    });

                    addedCount++;
                }

                if (addedCount > 0) {
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`Added ${addedCount} files to ${folderSelection.location}`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add files: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),


        // FOLDERS
        vscode.commands.registerCommand('ocrmnavigator.moveCategoryUp', async (item: NavigatorItem) => {
            if (!item || item.type !== 'folder') {
                return;
            }

            try {
                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find category index
                const categoryIndex = config.categories.findIndex(c => c.label === item.label);

                if (categoryIndex > 0) {
                    // Swap with category above
                    const temp = config.categories[categoryIndex];
                    config.categories[categoryIndex] = config.categories[categoryIndex - 1];
                    config.categories[categoryIndex - 1] = temp;

                    // Save config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`Moved "${item.label}" up`);
                } else {
                    vscode.window.showInformationMessage('Category is already at the top');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to move category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.moveCategoryDown', async (item: NavigatorItem) => {
            if (!item || item.type !== 'folder') {
                return;
            }

            try {
                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find category index
                const categoryIndex = config.categories.findIndex(c => c.label === item.label);

                if (categoryIndex >= 0 && categoryIndex < config.categories.length - 1) {
                    // Swap with category below
                    const temp = config.categories[categoryIndex];
                    config.categories[categoryIndex] = config.categories[categoryIndex + 1];
                    config.categories[categoryIndex + 1] = temp;

                    // Save config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`Moved "${item.label}" down`);
                } else {
                    vscode.window.showInformationMessage('Category is already at the bottom');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to move category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.addCategory', async () => {
            try {
                // Ask for category name
                const categoryName = await vscode.window.showInputBox({
                    prompt: 'Enter new category name',
                    placeHolder: 'e.g. COMPONENTS'
                });

                if (!categoryName) {
                    return; // User cancelled
                }

                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Check if category already exists
                if (config.categories.some(c => c.label === categoryName)) {
                    vscode.window.showWarningMessage(`Category "${categoryName}" already exists`);
                    return;
                }

                // Create new category with all required properties
                const newCategory: NavigatorCategoryItem = {
                    label: categoryName,
                    type: 'folder',
                    expanded: true,
                    items: [],
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    filePath: ''
                };

                config.categories.push(newCategory);

                // Save config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Added category "${categoryName}"`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.addSubcategory', async (parentItem: NavigatorItem) => {
            try {
                if (!parentItem || parentItem.type !== 'folder') {
                    vscode.window.showErrorMessage('Please select a category first');
                    return;
                }

                const subcategoryName = await vscode.window.showInputBox({
                    prompt: 'Enter subcategory name',
                    placeHolder: 'e.g. Important Files'
                });

                if (!subcategoryName) return;

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find parent category
                const parentCategory = config.categories.find(c => c.label === parentItem.label);
                if (!parentCategory) {
                    vscode.window.showErrorMessage('Parent category not found');
                    return;
                }

                // Create new subcategory
                const newSubcategory: NavigatorCategoryItem = {
                    label: subcategoryName,
                    type: 'folder',
                    expanded: false,
                    items: [],
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    filePath: ''
                };

                parentCategory.items.push(newSubcategory);

                // Save config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Added subcategory "${subcategoryName}"`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to add subcategory: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.renameCategory', async (item: NavigatorItem) => {
            if (!item || item.type !== 'folder') {
                return;
            }

            try {
                // Ask for new name
                const newName = await vscode.window.showInputBox({
                    prompt: 'Enter new category name',
                    placeHolder: 'e.g. COMPONENTS',
                    value: item.label
                });

                if (!newName || newName === item.label) {
                    return; // User cancelled or name unchanged
                }

                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Check if new name already exists
                if (config.categories.some(c => c.label === newName)) {
                    vscode.window.showWarningMessage(`Category "${newName}" already exists`);
                    return;
                }

                // Find and update category
                const category = config.categories.find(c => c.label === item.label);
                if (category) {
                    category.label = newName;

                    // Save config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`Renamed category to "${newName}"`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to rename category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.deleteCategory', async (item: NavigatorItem) => {
            if (!item || item.type !== 'folder') {
                return;
            }

            try {
                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find category
                const categoryIndex = config.categories?.findIndex(c => c.label === item.label) ?? -1;
                if (categoryIndex < 0) {
                    return;
                }

                // Count items in category (with null check)
                const category = config.categories[categoryIndex];
                const itemCount = category.items?.length ?? 0;

                // Confirm deletion
                const message = itemCount > 0
                    ? `Delete category "${item.label}" and ${itemCount} items?`
                    : `Delete category "${item.label}"?`;

                const confirmed = await vscode.window.showWarningMessage(
                    message,
                    { modal: true },
                    'Delete'
                );

                if (confirmed !== 'Delete') {
                    return;
                }

                // Remove category
                config.categories.splice(categoryIndex, 1);

                // Save config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Deleted category "${item.label}"`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to delete category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.collapseFolder', (item: NavigatorItem) => {
            updateFolderExpansion(item, false, vscode);
            vscode.commands.executeCommand('ocrmnavigator.refresh');
        }),
        vscode.commands.registerCommand('ocrmnavigator.expandFolder', (item: NavigatorItem) => {
            updateFolderExpansion(item, true, vscode);
            vscode.commands.executeCommand('ocrmnavigator.refresh');
        }),


        // URL
        // edit label uses ocrmnavigator.editFileLabel 
        // delete uses ocrmnavigator.deleteItem
        vscode.commands.registerCommand('ocrmnavigator.addUrlToNavigator', async () => {
            try {
                // Get URL from user
                const url = await vscode.window.showInputBox({
                    prompt: 'Enter the web URL',
                    placeHolder: 'https://example.com',
                    validateInput: value => {
                        if (!value.match(/^https?:\/\//)) {
                            return 'URL must start with http:// or https://';
                        }
                        return null;
                    }
                });

                if (!url) return;

                // Get label from user
                const label = await vscode.window.showInputBox({
                    prompt: 'Enter a label for this bookmark',
                    placeHolder: 'e.g. API Documentation'
                });

                if (!label) return;

                // create / select folder
                // create / select folder
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;
                const folderSelection = await selectFolderImport(config);
                if (!folderSelection) return;
                // create / select folder
                // create / select folder
                // need to fix folderSelection.targetItems below

                // Add the URL bookmark
                folderSelection.targetItems.push({
                    label: label,
                    path: url,
                    type: 'url',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: url
                });

                // Save and refresh
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`Added "${label}" to ${folderSelection.location}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add URL: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.editWebUrl', async (item: NavigatorItem) => {
            if (!item || item.type !== 'url') return;

            try {
                // Read current config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find the URL item in the config
                let urlFound = false;
                for (const category of config.categories) {
                    // Skip categories with no items
                    if (!category.items) continue;

                    const urlIndex = category.items.findIndex(
                        urlItem => urlItem.path === item.filePath && urlItem.type === 'url'
                    );

                    if (urlIndex >= 0) {
                        const urlItem = category.items[urlIndex];
                        // Get current values
                        const currentLabel = urlItem.label;
                        const currentUrl = urlItem.path;

                        // Ask for new label
                        const newLabel = await vscode.window.showInputBox({
                            prompt: 'Edit the bookmark label',
                            placeHolder: 'e.g. Company Website',
                            value: currentLabel
                        });

                        if (!newLabel) return; // User cancelled

                        // Ask for new URL
                        const newUrl = await vscode.window.showInputBox({
                            prompt: 'Edit the web URL',
                            placeHolder: 'https://example.com',
                            value: currentUrl,
                            validateInput: (value) => {
                                if (!value.match(/^https?:\/\//)) {
                                    return 'Please enter a valid URL starting with http:// or https://';
                                }
                                return null;
                            }
                        });

                        if (!newUrl) return; // User cancelled

                        // Update the item
                        urlItem.label = newLabel;
                        urlItem.path = newUrl;

                        // Save config
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                        // Refresh view
                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                        vscode.window.showInformationMessage('Bookmark updated');
                        urlFound = true;
                        break;
                    }
                }

                if (!urlFound) {
                    vscode.window.showWarningMessage('Bookmark not found in configuration');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to edit bookmark: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.removeUrl', async (item: NavigatorItem) => {
            try {
                // Validate the selected item
                if (!item || item.type !== 'url') {
                    vscode.window.showErrorMessage('Please select a URL to remove');
                    return;
                }

                // Confirm deletion
                const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Are you sure you want to remove "${item.label}"?`
                });
                if (confirm !== 'Yes') return;

                // Load current config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Flag to track if we found and removed the URL
                let urlRemoved = false;

                // Process each category
                for (const category of config.categories) {
                    // Check direct items in the category
                    if (category.items) {
                        for (let i = 0; i < category.items.length; i++) {
                            const item2 = category.items[i];

                            // Check if this is our target URL
                            if (item2.type === 'url' && item2.path === item.filePath && item2.label === item.label) {
                                category.items.splice(i, 1);
                                urlRemoved = true;
                                break;
                            }

                            // Check nested folders
                            if (item2.type === 'folder' && item2.children) {
                                const removeNestedUrl = (items: any[]): boolean => {
                                    for (let j = 0; j < items.length; j++) {
                                        if (items[j].type === 'url' &&
                                            items[j].path === item.filePath &&
                                            items[j].label === item.label) {
                                            items.splice(j, 1);
                                            return true;
                                        }
                                    }
                                    return false;
                                };

                                if (removeNestedUrl(item2.children)) {
                                    urlRemoved = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (urlRemoved) break;
                }

                if (urlRemoved) {
                    // Save updated config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`✅ Removed URL: ${item.label}`);
                } else {
                    vscode.window.showErrorMessage('❌ URL not found in config');
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to remove URL: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),


        // COMMANDS
        // edit label uses ocrmnavigator.editFileLabel 
        // delete uses ocrmnavigator.deleteItem
        vscode.commands.registerCommand('ocrmnavigator.addCommandToCategory', async (parentItem?: NavigatorItem) => {
            try {
                const command = await vscode.window.showInputBox({
                    prompt: 'Enter VS Code command ID',
                    placeHolder: 'editor.action.formatDocument',
                    validateInput: value => {
                        if (!value.trim()) return 'Command cannot be empty';
                        return null;
                    }
                });

                if (!command) return;

                const label = await vscode.window.showInputBox({
                    prompt: 'Enter display label',
                    placeHolder: 'Format Document'
                });

                if (!label) return;

                // create / select folder
                // create / select folder
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;
                const folderSelection = await selectFolderImport(config);
                if (!folderSelection) return;
                // create / select folder
                // create / select folder

                // Add the command
                folderSelection.targetItems.push({
                    label,
                    path: command,
                    type: 'command',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Save and refresh
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(
                    `Added command "${label}" to ${folderSelection.location}`
                );

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to add command: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.executeCommand', (item: NavigatorItem) => {
            vscode.window.showInformationMessage(`Executing cmd: ${item.filePath}`)
            vscode.commands.executeCommand(item.filePath).then(undefined, err => {
                vscode.window.showErrorMessage(
                    `Failed to execute "${item.label}": ${err.message}`
                );
            });
        }),
        vscode.commands.registerCommand('ocrmnavigator.editCommand', async (item: NavigatorItem) => {
            try {
                // Validate the selected item
                if (!item || item.type !== 'command' || item.type !== 'powershellCommand') {
                    vscode.window.showErrorMessage('Please select a command to edit');
                    return;
                }

                // Get current command from the item
                const currentCmd = item.filePath || '';

                // Get new command ID
                const newCommand = await vscode.window.showInputBox({
                    prompt: item.type === 'command' ? 'Edit VS Code command ID' : 'Edit PowerShell Command',
                    value: currentCmd,
                    validateInput: value => {
                        if (!value.trim()) return 'Command cannot be empty';
                        return null;
                    }
                });

                // User cancelled
                if (newCommand === undefined) return;

                // Get new label
                const newLabel = await vscode.window.showInputBox({
                    prompt: 'Edit display label',
                    value: item.label
                });

                // User cancelled
                if (newLabel === undefined) return;

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Flag to track if we found and updated the command
                let commandUpdated = false;

                // Function to update command in items array
                const updateCommand = (items: any[]): boolean => {
                    for (let i = 0; i < items.length; i++) {
                        const currentItem = items[i];

                        // Check if this is our target command
                        if (currentItem.type === 'command' && currentItem.type === 'powershellCommand' &&
                            currentItem.label === item.label) {

                            // Check for a match using any of the possible properties
                            if ((currentItem.filePath === currentCmd) ||
                                (currentItem.cmd === currentCmd) ||
                                (currentItem.path === currentCmd)) {

                                // Update the command properties
                                currentItem.label = newLabel;

                                // Update whichever property exists
                                if (currentItem.filePath !== undefined) {
                                    currentItem.filePath = newCommand;
                                }
                                if (currentItem.cmd !== undefined) {
                                    currentItem.cmd = newCommand;
                                }
                                if (currentItem.path !== undefined) {
                                    currentItem.path = newCommand;
                                }

                                return true;
                            }
                        }

                        // Check if this is a folder with nested items
                        if (currentItem.type === 'folder' && currentItem.items && Array.isArray(currentItem.items)) {
                            if (updateCommand(currentItem.items)) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                // Search through all categories
                for (const category of config.categories) {
                    if (category.items && updateCommand(category.items)) {
                        commandUpdated = true;
                        break;
                    }
                }

                if (commandUpdated) {
                    // Save updated config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`✅ Updated command: ${newLabel}`);
                } else {
                    vscode.window.showErrorMessage('❌ Command not found in config');

                    // Add debug info
                    console.log('Selected item:', JSON.stringify(item, null, 2));
                    console.log('Looking for command ID:', currentCmd);
                    console.log('First category items:', JSON.stringify(config.categories[0]?.items, null, 2));
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to edit command: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.showCommandsReference', () => {
            try {
                // Create and show a new webview panel
                const panel = vscode.window.createWebviewPanel(
                    'commandsReference', // Unique identifier
                    'VSCode Commands Reference', // Title displayed in the UI
                    vscode.ViewColumn.One, // Show in the editor column
                    {
                        enableScripts: true, // Enable JavaScript in the webview
                        retainContextWhenHidden: true // Keep the webview content when hidden
                    }
                );

                // Set the HTML content
                panel.webview.html = getCommandsWebviewContent();

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to show commands reference: ${errorMessage}`);
            }
        }),


        // TERMINAL COMMANDS
        // edit label uses ocrmnavigator.editFileLabel 
        // delete uses ocrmnavigator.deleteItem
        // edit label uses ocrmnavigator.editFileLabel 
        // edit uses ocrmnavigator.editCommand
        vscode.commands.registerCommand('ocrmnavigator.addTerminalCommandToCategory', async (parentItem?: NavigatorItem) => {
            try {
                const terminalCommand = await vscode.window.showInputBox({
                    prompt: 'Enter terminal command',
                    placeHolder: 'npm install',
                    validateInput: value => {
                        if (!value.trim()) return 'Command cannot be empty';
                        return null;
                    }
                });

                if (!terminalCommand) return;

                const label = await vscode.window.showInputBox({
                    prompt: 'Enter display label',
                    placeHolder: 'Install Dependencies'
                });

                if (!label) return;

                // Create / select folder
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;
                const folderSelection = await selectFolderImport(config);
                if (!folderSelection) return;

                // Add the terminal command
                folderSelection.targetItems.push({
                    label,
                    path: terminalCommand,
                    type: 'powershellCommand', // New type
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Save and refresh
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(
                    `Added terminal command "${label}" to ${folderSelection.location}`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to add terminal command: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.executeItem', (item: NavigatorItem) => {
            if (!item) return;

            // For debugging
            vscode.window.showInformationMessage(`path: ${item.path} -- filePath: ${item.filePath} -- cmd: ${item.cmd} -- label: ${item.label}`);

            switch (item.type) {
                case 'command':
                    if (item.path) {
                        vscode.commands.executeCommand(item.path);
                    } else {
                        vscode.window.showErrorMessage(`Failed to execute VS Code command: No path specified`);
                    }
                    break;

                case 'powershellCommand':
                    const commandToRun = item.path || item.cmd || item.filePath;
                    if (commandToRun) {
                        executeTerminalCommand(commandToRun);
                    } else {
                        vscode.window.showErrorMessage(`Failed to execute PowerShell command: No command specified`);
                    }
                    break;

                case 'file':
                    // Your existing code to open files
                    // ...
                    break;

                // Other types you may have
            }
        }),


        // SNIPPETS
        vscode.commands.registerCommand('ocrmnavigator.createSnippet', async (parentItem?: NavigatorItem) => {
            try {
                // Validate workspace
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder open');
                    return;
                }

                // Get snippet name with proper validation
                const snippetName = await vscode.window.showInputBox({
                    prompt: 'Enter snippet name',
                    placeHolder: 'e.g. React Component',
                    validateInput: value => {
                        if (!value?.trim()) return 'Snippet name cannot be empty';
                        if (/[\\/:*?"<>|]/.test(value)) return 'Invalid characters in name';
                        return null;
                    }
                });

                // Explicitly check for undefined (user cancellation)
                if (snippetName === undefined || snippetName.trim() === '') {
                    return;
                }

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Select or create category
                const category = await selectFolderImport(config);
                if (!category) return;

                // Set up snippets directory - using path.join handles all path separators correctly
                const snippetsDir = path.join(workspaceRoot, '.vscode', 'snippets-tsx');
                if (!fs.existsSync(snippetsDir)) {
                    fs.mkdirSync(snippetsDir, { recursive: true });
                }

                // Create safe filename - now guaranteed to have a value
                const cleanSnippetName = snippetName
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                const snippetFileName = `${cleanSnippetName}.snippet.tsx`;
                const snippetPath = path.join(snippetsDir, snippetFileName);

                // Create default snippet template with the first line being the snippet name
                const defaultSnippetContent = `${cleanSnippetName}`;

                // Create the snippet file
                fs.writeFileSync(snippetPath, defaultSnippetContent, 'utf8');

                // Add reference to the Navigator config
                category.targetItems.push({
                    label: snippetName,
                    path: `.vscode/ocrmnavigator.code-snippets`,
                    type: 'snippet',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: '',
                    data: {} as NavigatorItem
                });

                // Save the updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                // Refresh navigator view
                navigatorProvider.refresh();

                // Open the snippet file for editing
                const document = await vscode.workspace.openTextDocument(snippetPath);
                const editor = await vscode.window.showTextDocument(document);

                try {
                    // Get clipboard content and paste it on the second line if available
                    const clipboardContent = await vscode.env.clipboard.readText();

                    if (clipboardContent.trim() !== '') {
                        // Add a new line at position 0,cleanSnippetName.length (end of first line)
                        // Then insert the clipboard content
                        await editor.edit(editBuilder => {
                            // Insert a newline at the end of the first line
                            editBuilder.insert(
                                new vscode.Position(0, cleanSnippetName.length),
                                '\n\n' + clipboardContent
                            );

                            // Position cursor at start of inserted content
                            editor.selection = new vscode.Selection(
                                new vscode.Position(2, 0),
                                new vscode.Position(2, 0)
                            );
                        });
                    }
                } catch (clipboardError) {
                    // Just log the error, don't disrupt the user experience if clipboard access fails
                    console.error('Failed to access clipboard:', clipboardError);
                }
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                vscode.window.showInformationMessage(`✅ Created snippet: ${snippetName}`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.deleteSnippet', async (item: NavigatorItem) => {
            try {
                if (!item || item.type === 'snippet') {
                    vscode.window.showErrorMessage('Please select a snippet to delete');
                    return;
                }

                const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Are you sure you want to delete "${item.label}"?`
                });

                if (confirm !== 'Yes') return;

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find and remove from config
                const removeFromItems = (items: NavigatorItem[]): boolean => {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].label === item.label && items[i].filePath === item.filePath) {
                            items.splice(i, 1);
                            return true;
                        }
                        if (items[i].type === 'folder' && items[i].children) {
                            if (removeFromItems(items[i].children!)) return true;
                        }
                    }
                    return false;
                };

                if (removeFromItems(config.categories)) {
                    // Delete the file
                    if (fs.existsSync(item.filePath)) {
                        fs.unlinkSync(item.filePath);
                    }

                    // Save config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`Deleted snippet "${item.label}"`);
                } else {
                    vscode.window.showErrorMessage('Snippet not found in config');
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to delete snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.editSnippet', async (item: NavigatorItem) => {
            try {
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder open');
                    return;
                }

                // Get the snippets file path - use item.path or fallback to default
                const snippetsFilePath = path.join(
                    workspaceRoot,
                    item.path || ".vscode/ocrmnavigator.code-snippets"
                );

                if (!fs.existsSync(snippetsFilePath)) {
                    vscode.window.showErrorMessage(`Snippets file not found at ${snippetsFilePath}`);
                    return;
                }

                // Read the snippets JSON file
                const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                const snippets = JSON.parse(snippetsContent);

                // Get the snippet key - prioritize item.name, fallback to item.filePath
                const snippetKey = item.label
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                if (!snippetKey) {
                    vscode.window.showErrorMessage('No snippet key specified (both name and filePath are missing)');
                    return;
                }

                // Access the snippet data
                const snippetData = snippets[snippetKey];
                if (!snippetData) {
                    const availableSnippets = Object.keys(snippets).join(', ');
                    vscode.window.showErrorMessage(
                        `Snippet "${snippetKey}" not found in snippets file.\n` +
                        `Available snippets: ${availableSnippets || item.label}`
                    );
                    return;
                }

                // Create TSX version in the snippets-tsx directory
                const tsxSnippetsDir = path.join(workspaceRoot, '.vscode', 'snippets-tsx');
                if (!fs.existsSync(tsxSnippetsDir)) {
                    fs.mkdirSync(tsxSnippetsDir, { recursive: true });
                }

                const tsxFilePath = path.join(tsxSnippetsDir, `${snippetKey}.snippet.tsx`);

                // Convert to TSX format: 1st line = prefix, rest = body
                const tsxContent = [
                    item.label,
                    ...(snippetData.body || [])
                ].join('\n');

                // Write the TSX file
                fs.writeFileSync(tsxFilePath, tsxContent);

                // Open the TSX file for editing
                const doc = await vscode.workspace.openTextDocument(tsxFilePath);
                await vscode.window.showTextDocument(doc);

                // Use a separate variable for the timeout
                let watcherTimeout: NodeJS.Timeout;

                const watcher = fs.watch(tsxFilePath, async () => {
                    // Debounce to avoid multiple rapid saves
                    clearTimeout(watcherTimeout);
                    watcherTimeout = setTimeout(async () => {
                        try {
                            // Read the edited TSX content
                            const newTsxContent = fs.readFileSync(tsxFilePath, 'utf8');
                            const lines = newTsxContent.split('\n');

                            if (lines.length < 1) {
                                return; // Need at least prefix line
                            }

                            // Read the current snippets file again in case it changed
                            const currentContent = fs.readFileSync(snippetsFilePath, 'utf8');
                            const currentSnippets = JSON.parse(currentContent);

                            // Update the snippet data
                            currentSnippets[snippetKey] = {
                                ...(currentSnippets[snippetKey] || {}), // preserve existing properties
                                prefix: lines[0].trim(),
                                body: lines.slice(1)
                            };

                            // Save back to original snippets file
                            fs.writeFileSync(snippetsFilePath, JSON.stringify(currentSnippets, null, 2));

                            vscode.commands.executeCommand('ocrmnavigator.refresh');
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            vscode.window.showErrorMessage(`Error updating snippet: ${errorMessage}`);
                        }
                    }, 500);
                });

                // Clean up watcher when document closes
                const disposable = vscode.workspace.onDidCloseTextDocument(doc => {
                    if (doc.uri.fsPath === tsxFilePath) {
                        watcher.close();
                        disposable.dispose();
                        if (watcherTimeout) {
                            clearTimeout(watcherTimeout);
                        }
                    }
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to edit snippet: ${errorMessage}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.copySnippetToClipboard', async (item: NavigatorItem) => {
            try {
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder open');
                    return;
                }

                // Validate that we have a snippet item
                if (!item || item.type !== 'snippet') {
                    vscode.window.showWarningMessage('Selected item is not a snippet');
                    return;
                }

                // Get the snippets file path - use item.path or fallback to default
                const snippetsFilePath = path.join(
                    workspaceRoot,
                    item.path || ".vscode/ocrmnavigator.code-snippets"
                );

                if (!fs.existsSync(snippetsFilePath)) {
                    vscode.window.showErrorMessage(`Snippets file not found at ${snippetsFilePath}`);
                    return;
                }

                // Read the snippets JSON file
                const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                const snippets = JSON.parse(snippetsContent);

                // Get the snippet key - prioritize item.name, fallback to item.filePath
                const snippetKey = item.label
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                if (!snippetKey) {
                    vscode.window.showErrorMessage('No snippet key specified');
                    return;
                }

                // Access the snippet data
                const snippetData = snippets[snippetKey];
                if (!snippetData) {
                    vscode.window.showErrorMessage(`Snippet "${snippetKey}" not found in snippets file.`);
                    return;
                }

                // Get the body content from the snippet data
                const snippetBody = Array.isArray(snippetData.body)
                    ? snippetData.body.join('\n')
                    : snippetData.body || '';

                // Copy to clipboard
                await vscode.env.clipboard.writeText(snippetBody);

                // Notify user
                vscode.window.showInformationMessage(`✅ Snippet '${item.label}' copied to clipboard`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to copy snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),


        // MD
        vscode.commands.registerCommand('ocrmnavigator.createMD', async (parentItem?: NavigatorItem) => {
            try {
                // Validate workspace
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder open');
                    return;
                }

                // Get snippet name with proper validation
                const snippetName = await vscode.window.showInputBox({
                    prompt: 'Enter .md name',
                    placeHolder: 'e.g. React Component',
                    validateInput: value => {
                        if (!value?.trim()) return 'Md name cannot be empty';
                        if (/[\\/:*?"<>|]/.test(value)) return 'Invalid characters in name';
                        return null;
                    }
                });

                // Explicitly check for undefined (user cancellation)
                if (snippetName === undefined || snippetName.trim() === '') {
                    return;
                }

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Select or create category
                const category = await selectFolderImport(config);
                if (!category) return;

                // Set up snippets directory - using path.join handles all path separators correctly
                const snippetsDir = path.join(workspaceRoot, '.vscode', '.md');
                if (!fs.existsSync(snippetsDir)) {
                    fs.mkdirSync(snippetsDir, { recursive: true });
                }

                // Create safe filename - now guaranteed to have a value
                const cleanSnippetName = snippetName
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                const snippetFileName = `${cleanSnippetName}.md`;
                const snippetPath = path.join(snippetsDir, snippetFileName);

                // Create default snippet template
                const defaultSnippetContent = `# ${snippetName}\n\nEnter your markdown content here.`;

                // Create the snippet file
                fs.writeFileSync(snippetPath, defaultSnippetContent, 'utf8');

                // Add reference to the Navigator config
                category.targetItems.push({
                    label: snippetName,
                    path: `.vscode/.md/${snippetFileName}`,
                    type: 'md',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Save the updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                // Open the snippet file for editing in the current active editor group
                const document = await vscode.workspace.openTextDocument(snippetPath);
                await vscode.window.showTextDocument(document);

                // Then open the preview in a side-by-side editor using the built-in Markdown preview command
                await vscode.commands.executeCommand('markdown.showPreviewToSide', document.uri);

                vscode.window.showInformationMessage(`✅ Created snippet: ${snippetName}`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.createMDWCheat', async (parentItem?: NavigatorItem) => {
            try {
                // Validate workspace
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder open');
                    return;
                }

                // Get snippet name with proper validation
                const snippetName = await vscode.window.showInputBox({
                    prompt: 'Enter .md name',
                    placeHolder: 'e.g. React Component',
                    validateInput: value => {
                        if (!value?.trim()) return 'Md name cannot be empty';
                        if (/[\\/:*?"<>|]/.test(value)) return 'Invalid characters in name';
                        return null;
                    }
                });

                // Explicitly check for undefined (user cancellation)
                if (snippetName === undefined || snippetName.trim() === '') {
                    return;
                }

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Select or create category
                const category = await selectFolderImport(config);
                if (!category) return;

                // Set up snippets directory - using path.join handles all path separators correctly
                const snippetsDir = path.join(workspaceRoot, '.vscode', '.md');
                if (!fs.existsSync(snippetsDir)) {
                    fs.mkdirSync(snippetsDir, { recursive: true });
                }

                // Create safe filename - now guaranteed to have a value
                const cleanSnippetName = snippetName
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                const snippetFileName = `${cleanSnippetName}.md`;
                const snippetPath = path.join(snippetsDir, snippetFileName);

                // Create default snippet template
                const defaultSnippetContent = `# ${snippetName}\n\nEnter your markdown content here.`;

                // Create the snippet file
                fs.writeFileSync(snippetPath, defaultSnippetContent, 'utf8');

                // Add reference to the Navigator config
                category.targetItems.push({
                    label: snippetName,
                    path: `.vscode/.md/${snippetFileName}`,
                    type: 'md',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Create or load the cheat sheet file path
                // const cheatSheetFileName = 'markdown-cheatsheet.md';
                //  const cheatSheetPath = path.join(snippetsDir, cheatSheetFileName);

                // Check if cheat sheet exists - if not, create it
                //   if (!fs.existsSync(cheatSheetPath)) {
                //       const cheatSheetContent = ''
                //      fs.writeFileSync(cheatSheetPath, cheatSheetContent, 'utf8');
                //   }

                // Save the updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                vscode.commands.executeCommand('ocrmnavigator.refresh');
                // Open the snippet file for editing in the current active editor group
                const document = await vscode.workspace.openTextDocument(snippetPath);
                await vscode.window.showTextDocument(document);

                // Then open the preview in a side-by-side editor using the built-in Markdown preview command
                await vscode.commands.executeCommand('markdown.showPreviewToSide', document.uri);

                // Open the cheat sheet in a third editor group
                //  const cheatSheetDoc = await vscode.workspace.openTextDocument(cheatSheetPath);

                // Configure for opening in a third editor group
                // This creates a third editor column if it doesn't exist
                //  await vscode.window.showTextDocument(cheatSheetDoc, {
                //    viewColumn: vscode.ViewColumn.Three,
                //    preview: false
                //  });
                const panel = vscode.window.createWebviewPanel(
                    'markdownGuide',
                    'Markdown Guide',
                    vscode.ViewColumn.Three,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );
                panel.webview.html = getMarkdownGuideContent();
                vscode.window.showInformationMessage(`✅ Created snippet: ${snippetName} with cheat sheet`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to create snippet with cheat sheet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.editMDLabel', async (parentItem?: NavigatorItem) => {
            if (!parentItem || parentItem.type !== 'md') {
                vscode.window.showErrorMessage('Please select a Markdown file to edit');
                return;
            }

            try {
                // Get the new label from user input
                const newLabel = await vscode.window.showInputBox({
                    prompt: 'Enter new label for this Markdown file',
                    value: parentItem.label,
                    validateInput: (value) => {
                        if (!value || value.trim().length === 0) {
                            return 'Label cannot be empty';
                        }
                        return null;
                    }
                });

                if (!newLabel) return; // User cancelled

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find and update the MD file in config
                let itemUpdated = false;
                for (const category of config.categories) {
                    for (const item of category.items || []) {
                        if (item.type === 'md' && item.path === parentItem.filePath) {
                            item.label = newLabel;
                            itemUpdated = true;
                            break;
                        }
                    }
                    if (itemUpdated) break;
                }

                if (itemUpdated) {
                    // Save changes
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    navigatorProvider.refresh();
                    vscode.window.showInformationMessage(`Updated label for "${parentItem.filePath}"`);
                } else {
                    vscode.window.showWarningMessage('Markdown file not found in config');
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to edit label: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.removeMD', async (parentItem?: NavigatorItem) => {
            if (!parentItem || parentItem.type !== 'md') {
                vscode.window.showErrorMessage('Please select a Markdown file to remove');
                return;
            }

            try {
                // Confirm deletion
                const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Are you sure you want to remove "${parentItem.label}"?`
                });

                if (confirm !== 'Yes') return;

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find and remove the MD file
                let itemRemoved = false;
                for (const category of config.categories) {
                    const initialLength = category.items?.length || 0;

                    // Filter out the matching MD file
                    category.items = category.items?.filter(item =>
                        !(item.type === 'md' &&
                            (item.path === parentItem.filePath || item.path === parentItem.path))
                        || []);

                    if (category.items.length < initialLength) {
                        itemRemoved = true;
                    }
                }

                if (itemRemoved) {
                    // Save changes
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    navigatorProvider.refresh();
                    vscode.window.showInformationMessage(`Removed "${parentItem.label}" from navigator`);
                } else {
                    vscode.window.showWarningMessage('Markdown file not found in config');
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to remove MD file: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.editMD', async (parentItem?: NavigatorItem) => {
            try {
                // Validate selection
                if (!parentItem || parentItem.type !== 'md') {
                    vscode.window.showErrorMessage('Please select a Markdown file to edit');
                    return;
                }

                // Get full path to the MD file
                const mdPath = path.join(workspaceRoot, parentItem.filePath);

                // Verify file exists
                if (!fs.existsSync(mdPath)) {
                    vscode.window.showErrorMessage(`Markdown file not found: ${mdPath}`);
                    return;
                }

                // Open the file in editor (first pane)
                const document = await vscode.workspace.openTextDocument(mdPath);
                await vscode.window.showTextDocument(document, {
                    viewColumn: vscode.ViewColumn.One,
                    preview: false
                });

                // Open preview in second pane
                await vscode.commands.executeCommand('markdown.showPreviewToSide');

                vscode.window.showInformationMessage(`Editing ${path.basename(mdPath)}`);

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to edit Markdown file: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.viewMarkdownGuide', () => {
            try {
                // Create and show a new webview panel
                const panel = vscode.window.createWebviewPanel(
                    'markdownGuide', // Unique identifier
                    'Markdown Guide', // Title displayed in the UI
                    vscode.ViewColumn.One, // Show in the editor column
                    {
                        enableScripts: true, // Enable JavaScript in the webview
                        retainContextWhenHidden: true // Keep the webview content when hidden
                    }
                );

                // Set the HTML content
                panel.webview.html = getMarkdownGuideContent();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to show Markdown guide: ${errorMessage}`);
            }
        }),


        // FORMATTER 
        // Register the command to format the current file
        vscode.commands.registerCommand('ocrmnavigator.formatCurrentFile', async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active editor found.');
                    return;
                }

                const document = editor.document;
                const fileType = document.languageId;
                const text = document.getText();

                // Get formatter config for this file type
                const config = await getFormatterConfig();

                if (!config || !config.formatters || !config.formatters[fileType] || !config.formatters[fileType].enabled) {
                    vscode.window.showInformationMessage(`No formatter configured for ${fileType} files or formatting is disabled.`);
                    return;
                }

                // Format the content based on file type
                const formattedText = formatContent(text, fileType, config.formatters[fileType]);

                // Replace entire document content with formatted text
                await editor.edit(editBuilder => {
                    const firstLine = document.lineAt(0);
                    const lastLine = document.lineAt(document.lineCount - 1);
                    const range = new vscode.Range(firstLine.range.start, lastLine.range.end);
                    editBuilder.replace(range, formattedText);
                });

                vscode.window.showInformationMessage(`${fileType} file formatted successfully.`);
            } catch (error) {
                vscode.window.showErrorMessage(`Format failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.configureFormatters', async () => {
            try {
                const panel = vscode.window.createWebviewPanel(
                    'formatterConfig',
                    'OCRM Navigator Formatter Configuration',
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                // Load existing config
                const config = await getFormatterConfig();

                // Generate webview HTML
                panel.webview.html = getFormatterConfigWebviewContent(panel.webview, config);

                // Handle messages from webview
                panel.webview.onDidReceiveMessage(async message => {
                    if (message.command === 'saveConfig') {
                        try {
                            await saveFormatterConfig(message.config);
                            vscode.window.showInformationMessage('Formatter configuration saved successfully.');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to save formatter config: ${error.message}`);
                        }
                    }
                });
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to open formatter configuration: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),


        // no longer in use
        vscode.commands.registerCommand('ocrmnavigator.removeCommand1', async (item: NavigatorItem) => {
            try {
                // Validate the selected item
                if (!item || item.type !== 'command') {
                    vscode.window.showErrorMessage('Please select a command to remove');
                    return;
                }

                // Confirm deletion
                const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: `Are you sure you want to remove "${item.label}"?`
                });
                if (confirm !== 'Yes') return;

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Command ID from the item
                const commandId = item.filePath || '';

                // Flag to track if we found and removed the command
                let commandRemoved = false;

                // Function to remove command from items array
                const removeCommand = (items: any[]): boolean => {
                    for (let i = 0; i < items.length; i++) {
                        const currentItem = items[i];

                        // Check if this is our target command
                        if (currentItem.type === 'command' &&
                            currentItem.label === item.label) {

                            // Check for a match using any of the possible properties
                            if ((currentItem.filePath === commandId) ||
                                (currentItem.cmd === commandId) ||
                                (currentItem.path === commandId)) {

                                // Remove the command from the array
                                items.splice(i, 1);
                                return true;
                            }
                        }

                        // Check if this is a folder with nested items
                        if (currentItem.type === 'folder' && currentItem.items && Array.isArray(currentItem.items)) {
                            if (removeCommand(currentItem.items)) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                // Search through all categories
                for (const category of config.categories) {
                    if (category.items && removeCommand(category.items)) {
                        commandRemoved = true;
                        break;
                    }
                }

                if (commandRemoved) {
                    // Save updated config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                    vscode.window.showInformationMessage(`✅ Removed command: ${item.label}`);
                } else {
                    vscode.window.showErrorMessage('❌ Command not found in config');

                    // Add debug info
                    console.log('Selected item:', JSON.stringify(item, null, 2));
                    console.log('Looking for command ID:', commandId);
                    console.log('First category items:', JSON.stringify(config.categories[0]?.items, null, 2));
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to remove command: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        })
}



/** Function to generate the HTML content for our webview

// Helper function to find an item in the configuration
function findItemInConfig(config: NavigatorConfig, item: NavigatorItem): {
    parentCategory: NavigatorCategoryItem | null,
    itemIndex: number,
    itemsArray: any[]
} | null {
    // Search through all categories and their nested items
    for (const category of config.categories) {
        // Check if the item is directly in this category
        const categoryItemIndex = category.items.findIndex(fileItem =>
            fileItem.label === item.label &&
            (fileItem.path === item.filePath || fileItem.filePath === item.filePath)
        );

        if (categoryItemIndex !== -1) {
            return {
                parentCategory: category,
                itemIndex: categoryItemIndex,
                itemsArray: category.items
            };
        }

        // Search through the category's subfolders
        for (let i = 0; i < category.items.length; i++) {
            const subItem = category.items[i];

            if (subItem.type === 'folder' && 'items' in subItem) {
                const folderItem = subItem as NavigatorCategoryItem;

                // Search in this folder's items
                const subIndex = folderItem.items.findIndex(fileItem =>
                    fileItem.label === item.label &&
                    (fileItem.path === item.filePath || fileItem.filePath === item.filePath)
                );

                if (subIndex !== -1) {
                    return {
                        parentCategory: folderItem,
                        itemIndex: subIndex,
                        itemsArray: folderItem.items
                    };
                }

                // Recursively search deeper (for nested folders)
                const deepResult = searchNestedFolder(folderItem, item);
                if (deepResult) {
                    return deepResult;
                }
            }
        }
    }

    return null;
}
 */