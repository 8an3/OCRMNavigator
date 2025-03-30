import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NavigatorProvider, NavigatorItem, NavigatorConfig, NavigatorCategoryItem } from './navigatorView';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activating...');

    // Verify workspace is open
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Please open a workspace folder first');
        return;
    }
    console.log('Workspace root:', workspaceRoot);

    // Ensure storage directory exists
    const storagePath = context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }

    // Set up config file path
    const configPath = path.join(storagePath, 'navigator-config.json');
    console.log('Configuration path:', configPath);

    // Create default config if needed
    if (!fs.existsSync(configPath)) {
        const defaultConfig = {
            "categories": [
                {
                    "label": "CMDS",
                    "type": "folder",
                    "expanded": true,
                    "items": [
                        {
                            "label": "Formatting",
                            "type": "folder",
                            "items": [
                                {
                                    "label": "Format Document",
                                    "cmd": "editor.action.formatDocument",
                                    "type": "command"
                                }
                            ]
                        },
                        {
                            "label": "Folding",
                            "type": "folder",
                            "items": [
                                {
                                    "label": "Fold Level 1",
                                    "cmd": "editor.foldLevel1",
                                    "type": "command"
                                }
                            ]
                        }
                    ]
                },
                {
                    "label": "FILES",
                    "expanded": true,
                    "items": [
                        {
                            "label": "Admin Dashboard",
                            "path": "apps/app/app/routes/portal/$dept/settings/general.tsx",
                            "type": "file"
                        },
                        {
                            "label": "Client Dashboard",
                            "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx",
                            "type": "file"
                        }
                    ]
                },
                {
                    "label": "RELATED",
                    "expanded": false,
                    "items": [
                        {
                            "label": "client.website",
                            "path": "apps/app/app/routes/dealer/client/home.tsx",
                            "type": "file"
                        }
                    ]
                },
                {
                    "label": "COMPONENTS",
                    "expanded": false,
                    "items": [
                        {
                            "label": "app.sidebar",
                            "path": "apps/app/app/routes/__component/appSidebar.tsx",
                            "type": "file"
                        }
                    ]
                },
                {
                    "label": "UTILS",
                    "expanded": false,
                    "items": [
                        {
                            "label": "loader.server",
                            "path": "apps/app/app/utils/loader.server.tsx",
                            "type": "file"
                        }
                    ]
                },
                // copy snippet to clipboard when clicked
                {
                    "label": "SNIPPETS",
                    "expanded": false,
                    "items": [
                        {
                            "label": "loader.server",
                            "path": "apps/app/app/utils/loader.server.tsx"
                        }
                    ]
                },
                {
                    "label": "WEB",
                    "expanded": true,
                    "items": [
                        {
                            "label": "localhost/somewhere",
                            "path": "http://localhost:3000",
                            "type": "url"
                        },
                        {
                            "label": "Github",
                            "path": "https://www.github.com",
                            "type": "url"
                        },
                        {
                            "label": "Vercel Dashboard",
                            "path": "https://vercel.com/user",
                            "type": "url"
                        }
                    ]
                }, 
                 {
                    "label": "MD",
                    "expanded": false,
                    "items": [
                        {
                            "label": "Admin Dashboard",
                            "path": "apps/app/app/routes/portal/$dept/settings/general.tsx",
                            "type": "file"
                        },
                        {
                            "label": "Client Dashboard",
                            "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx",
                            "type": "file"
                        }
                    ]
                }, 
                {
                   "label": "TODO",
                   "expanded": false,
                   "items": [
                       {
                           "label": "Admin Dashboard",
                           "path": "apps/app/app/routes/portal/$dept/settings/general.tsx",
                           "type": "file"
                       },
                       {
                           "label": "Client Dashboard",
                           "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx",
                           "type": "file"
                       }
                   ]
               }
            ]
        };
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }

    // Initialize provider
    const navigatorProvider = new NavigatorProvider(workspaceRoot, configPath);

    // Register tree view
    const view = vscode.window.createTreeView('ocrmnavigatorNavigator', {
        treeDataProvider: navigatorProvider,
        showCollapseAll: true
    });

    let itemToMove: NavigatorItem | null = null;
    // helper function for snippets
    const SNIPPETS_TSX_DIR = path.join('.vscode', 'snippets-tsx');
    const SNIPPETS_DIR = path.join('.vscode');
    interface SnippetDefinition {
        prefix: string;
        body: string[];
        description: string;
        scope: string;
    }
    
    interface SnippetCollection {
        [name: string]: SnippetDefinition;
    }
    
    async function processSnippetFiles(workspaceRoot: string) {
        const tsxSnippetsPath = path.join(workspaceRoot, SNIPPETS_TSX_DIR);
        const snippetsPath = path.join(workspaceRoot, SNIPPETS_DIR);
        const snippetFilePath = path.join(snippetsPath, 'ocrmnavigator.code-snippets');
    
        // Create directories if they don't exist
        if (!fs.existsSync(tsxSnippetsPath)) {
            fs.mkdirSync(tsxSnippetsPath, { recursive: true });
        }
        if (!fs.existsSync(snippetsPath)) {
            fs.mkdirSync(snippetsPath, { recursive: true });
        }
    
        // Load existing snippets if file exists
        let existingSnippets: SnippetCollection = {};
        if (fs.existsSync(snippetFilePath)) {
            try {
                existingSnippets = JSON.parse(fs.readFileSync(snippetFilePath, 'utf8')) as SnippetCollection;
            } catch (e) {
                console.error('Error parsing existing snippets:', e);
                existingSnippets = {};
            }
        }
    
        // Process all .tsx snippet files
        const tsxFiles = fs.readdirSync(tsxSnippetsPath)
            .filter(file => file.endsWith('.snippet.tsx'));
    
        let changed = false;
        for (const tsxFile of tsxFiles) {
            const tsxFilePath = path.join(tsxSnippetsPath, tsxFile);
            const snippetName = path.basename(tsxFile, '.snippet.tsx');
    
            try {
                // Read TSX file content
                const content = fs.readFileSync(tsxFilePath, 'utf8');
                const lines = content.split('\n').filter(line => line.trim() !== '');
    
                if (lines.length < 1) {
                    vscode.window.showWarningMessage(`Snippet ${tsxFile} needs at least 1 line (prefix)`);
                    continue;
                }
    
                // Extract prefix (first line) and body (remaining lines)
                const prefix = lines[0].trim();
                const body = lines.slice(1).join('\n');
    
                // Add/update the snippet in our collection
                existingSnippets[snippetName] = {
                    prefix,
                    body: body.split('\n'),
                    description: `Custom snippet from ${tsxFile}`,
                    scope: "typescript,typescriptreact"
                };
    
                changed = true;
    
                // Delete the processed TSX file
                fs.unlinkSync(tsxFilePath);
    
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to process ${tsxFile}: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    
        // Only write if we made changes
        if (changed) {
            fs.writeFileSync(snippetFilePath, JSON.stringify(existingSnippets, null, 2));
        }
    }
    function setupFileWatcher(workspaceRoot: string) {
        const tsxSnippetsPath = path.join(workspaceRoot, SNIPPETS_TSX_DIR);
        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(tsxSnippetsPath, '*.snippet.tsx')
        );

        watcher.onDidChange(uri => processSnippetFiles(workspaceRoot));
        watcher.onDidCreate(uri => processSnippetFiles(workspaceRoot));
        watcher.onDidDelete(uri => processSnippetFiles(workspaceRoot));

        return watcher;
    }


    // Initial processing
    processSnippetFiles(workspaceRoot);

    // Set up watcher
    const watcher = setupFileWatcher(workspaceRoot);

    context.subscriptions.push(
        // DRAG AND DROP 
        vscode.commands.registerCommand('ocrmnavigator.moveItem', (item: NavigatorItem) => {
            itemToMove = item;
            vscode.window.showInformationMessage(`Selected "${item.label}" to move. Now select destination folder.`);
        }),

        vscode.commands.registerCommand('ocrmnavigator.setMoveTarget', async (targetFolder: NavigatorItem) => {
            if (!itemToMove) {
                vscode.window.showErrorMessage('No item selected to move');
                return;
            }

            try {
                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Remove from original location
                const removeItem = (items: NavigatorItem[]): boolean => {
                    const index = items.findIndex(i =>
                        i.label === itemToMove?.label &&
                        i.filePath === itemToMove?.filePath
                    );
                    if (index > -1) {
                        items.splice(index, 1);
                        return true;
                    }

                    for (const item of items) {
                        if (item.type === 'folder' && item.children && removeItem(item.children)) {
                            return true;
                        }
                    }
                    return false;
                };

                if (!removeItem(config.categories)) {
                    vscode.window.showErrorMessage('Could not find original item in config');
                    return;
                }

                // Add to target folder
                const addToFolder = (items: NavigatorItem[]): boolean => {
                    for (const item of items) {
                        if (item.label === targetFolder.label && item.type === 'folder') {
                            if (!item.children) item.children = [];
                            item.children.push(itemToMove!);
                            return true;
                        }
                        if (item.type === 'folder' && item.children && addToFolder(item.children)) {
                            return true;
                        }
                    }
                    return false;
                };

                if (!addToFolder(config.categories)) {
                    vscode.window.showErrorMessage('Could not find target folder in config');
                    return;
                }

                // Save changes
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                navigatorProvider.refresh();
                vscode.window.showInformationMessage(`Moved "${itemToMove.label}" to "${targetFolder.label}"`);
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
                if (!workspaceRoot) {
                    vscode.window.showErrorMessage('No workspace folder open');
                    return;
                }

                const targetPath = path.join(workspaceRoot, 'navigator-config.json');

                // Check if file already exists
                if (fs.existsSync(targetPath)) {
                    const overwrite = await vscode.window.showQuickPick(
                        ['Overwrite', 'Cancel'],
                        { placeHolder: 'Config file already exists in workspace. Overwrite?' }
                    );

                    if (overwrite !== 'Overwrite') {
                        return;
                    }
                }

                // Copy config file
                fs.copyFileSync(configPath, targetPath);
                vscode.window.showInformationMessage(`Config exported to ${targetPath}`);

                // Open the exported file
                const doc = await vscode.workspace.openTextDocument(targetPath);
                await vscode.window.showTextDocument(doc);
            } catch (error) {
                vscode.window.showErrorMessage(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.importConfig', async () => {
            try {
                const fileUris = await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    openLabel: 'Import',
                    filters: { 'JSON Files': ['json'] }
                });

                if (!fileUris || fileUris.length === 0) {
                    return;
                }

                const sourcePath = fileUris[0].fsPath;
                const content = fs.readFileSync(sourcePath, 'utf8');

                // Validate JSON
                JSON.parse(content); // Will throw if invalid

                // Backup current config
                if (fs.existsSync(configPath)) {
                    const backupPath = configPath + '.bak';
                    fs.copyFileSync(configPath, backupPath);
                }

                // Copy new config
                fs.copyFileSync(sourcePath, configPath);

                // Reload
                navigatorProvider.loadConfig();
                vscode.window.showInformationMessage('Config imported successfully!');
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
                const disposable = vscode.workspace.onDidSaveTextDocument(savedDoc => {
                    if (savedDoc.uri.fsPath === configPath) {
                        navigatorProvider.loadConfig();
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
            navigatorProvider.loadConfig();
            vscode.window.showInformationMessage('Navigator refreshed');
        }),
        vscode.commands.registerCommand('ocrmnavigator.refresh', () => { navigatorProvider.loadConfig(); }),

        // FILE
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
                const folderSelection = await selectFolder(config);
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

                // Refresh the view
                navigatorProvider.loadConfig();
                vscode.window.showInformationMessage(`Added "${userLabel}" to ${folderSelection.location}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.editFileLabel', async (item: NavigatorItem) => {
            if (!item || item.type !== 'file') {
                return;
            }

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

                            // Refresh view
                            navigatorProvider.loadConfig();
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
            if (!item || (item.type !== 'file' && item.type !== 'url' && item.type !== 'command')) {
                return;
            }

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
                for (const category of config.categories) {
                    // Use optional chaining and nullish coalescing
                    const itemIndex = category.items?.findIndex(existingItem => {
                        // For files, compare full paths
                        if (item.type === 'file') {
                            return existingItem.path &&
                                path.join(workspaceRoot, existingItem.path) === item.filePath;
                        }
                        // For URLs and commands, compare directly
                        return existingItem.path === item.filePath ||
                            existingItem.cmd === item.cmd;
                    }) ?? -1;  // Default to -1 if items is undefined

                    if (itemIndex >= 0) {
                        // Remove item (using optional chaining again)
                        category.items?.splice(itemIndex, 1);
                        itemRemoved = true;

                        // Save config
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                        // Refresh view
                        navigatorProvider.loadConfig();
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

        // CATEGORIES
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

                    // Refresh view
                    navigatorProvider.loadConfig();
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

                    // Refresh view
                    navigatorProvider.loadConfig();
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

                // Refresh view
                navigatorProvider.loadConfig();
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

                // Refresh view
                navigatorProvider.refresh();
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

                    // Refresh view
                    navigatorProvider.loadConfig();
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

                // Refresh view
                navigatorProvider.loadConfig();
                vscode.window.showInformationMessage(`Deleted category "${item.label}"`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to delete category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.collapseFolder', (item: NavigatorItem) => { updateFolderExpansion(item, false); }),
        vscode.commands.registerCommand('ocrmnavigator.expandFolder', (item: NavigatorItem) => { updateFolderExpansion(item, true); }),

        // URL
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
                const folderSelection = await selectFolder(config);
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
                navigatorProvider.loadConfig();
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
                        navigatorProvider.loadConfig();
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
                    navigatorProvider.loadConfig();
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
                const folderSelection = await selectFolder(config);
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
                navigatorProvider.loadConfig();
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
                if (!item || item.type !== 'command') {
                    vscode.window.showErrorMessage('Please select a command to edit');
                    return;
                }

                // Get current command from the item
                const currentCmd = item.filePath || '';

                // Get new command ID
                const newCommand = await vscode.window.showInputBox({
                    prompt: 'Edit VS Code command ID',
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
                        if (currentItem.type === 'command' &&
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
                    navigatorProvider.loadConfig();
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
        vscode.commands.registerCommand('ocrmnavigator.removeCommand', async (item: NavigatorItem) => {
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
                    navigatorProvider.loadConfig();
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
                const category = await selectFolder(config);
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

                // Create default snippet template
                const defaultSnippetContent = `${cleanSnippetName}`;

                // Create the snippet file
                fs.writeFileSync(snippetPath, defaultSnippetContent, 'utf8');

                // Add reference to the Navigator config
                category.targetItems.push({
                    label: snippetName,
                    path: `.vscode/ocrmnavigator.code-snippets`,
                    type: 'file',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                             filePath:''
                });

                // Save the updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                // Refresh the explorer view
                navigatorProvider.loadConfig();

                // Open the snippet file for editing
                const document = await vscode.workspace.openTextDocument(snippetPath);
                await vscode.window.showTextDocument(document);

                vscode.window.showInformationMessage(`✅ Created snippet: ${snippetName}`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        vscode.commands.registerCommand('ocrmnavigator.deleteSnippet', async (item: NavigatorItem) => {
            try {
                if (!item || item.type !== 'file' || !item.filePath.includes('snippets')) {
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
                    navigatorProvider.refresh();
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
        
                            // Update the tree view if needed
                            navigatorProvider.refresh();
        
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
                const category = await selectFolder(config);
                if (!category) return;

                // Set up snippets directory - using path.join handles all path separators correctly
                const snippetsDir = path.join(workspaceRoot, '.vscode', 'snippets');
                if (!fs.existsSync(snippetsDir)) {
                    fs.mkdirSync(snippetsDir, { recursive: true });
                }

                // Create safe filename - now guaranteed to have a value
                const cleanSnippetName = snippetName
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');

                const snippetFileName = `${cleanSnippetName}.code-snippets.md`;
                const snippetPath = path.join(snippetsDir, snippetFileName);

                // Create default snippet template
                const defaultSnippetContent = `${cleanSnippetName}
// prefix will be on the top line
// you can insert the snippet below
`;

                // Create the snippet file
                fs.writeFileSync(snippetPath, defaultSnippetContent, 'utf8');

                // Add reference to the Navigator config
                category.targetItems.push({
                    label: snippetName,
                    path: `.vscode/snippets/${snippetFileName}`,
                    type: 'file',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Save the updated config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                // Refresh the explorer view
                navigatorProvider.loadConfig();

                // Open the snippet file for editing
                const document = await vscode.workspace.openTextDocument(snippetPath);
                await vscode.window.showTextDocument(document);

                vscode.window.showInformationMessage(`✅ Created snippet: ${snippetName}`);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),

        watcher, view, { dispose: () => view.dispose() }
    );
    // Helper function for folder expansion
    async function updateFolderExpansion(item: NavigatorItem, expanded: boolean) {
        try {
            if (!item || item.type !== 'folder') {
                vscode.window.showErrorMessage('Please select a folder first');
                return;
            }

            const configContent = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configContent) as NavigatorConfig;

            // Recursive function to find and update the folder
            const updateFolder = (items: NavigatorItem[]): boolean => {
                return items.some(category => {
                    if (category.label === item.label && category.type === 'folder') {
                        (category as NavigatorCategoryItem).expanded = expanded;
                        return true;
                    }
                    if (category.type === 'folder' && category.children) {
                        return updateFolder(category.children);
                    }
                    return false;
                });
            };

            if (updateFolder(config.categories)) {
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                navigatorProvider.refresh();
                const action = expanded ? 'expanded' : 'collapsed';
                vscode.window.showInformationMessage(`Folder "${item.label}" ${action}`);
            } else {
                vscode.window.showErrorMessage('Folder not found in config');
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to update folder: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    };
    // Function to select or create folder
    const selectFolder = async (config: NavigatorConfig): Promise<{ targetItems: NavigatorItem[], location: string } | undefined> => {
        // Get all available folders
        const allFolders: { label: string, items: NavigatorItem[] }[] = [];

        const collectFolders = (items: NavigatorItem[], path: string): void => {
            items.forEach(item => {
                if (item.type === 'folder') {
                    const fullPath = `${path}/${item.label}`;
                    allFolders.push({
                        label: fullPath,
                        items: (item as NavigatorCategoryItem).items || []
                    });
                    if ((item as NavigatorCategoryItem).items) {
                        collectFolders((item as NavigatorCategoryItem).items, fullPath);
                    }
                }
            });
        };

        collectFolders(config.categories, '');

        // Define proper types for QuickPick options
        type FolderOption = {
            label: string;
            description: string;
            folder?: { label: string; items: NavigatorItem[] };
        };

        // Prepare quick pick options
        const options: FolderOption[] = [
            {
                label: 'Create new folder',
                description: 'Add a new top-level folder'
            },
            ...allFolders.map(folder => ({
                label: folder.label,
                description: `${folder.items.length} items`,
                folder: folder // Explicitly include folder property
            }))
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select a folder or create new'
        });

        if (!selected) return undefined;

        if (selected.label === 'Create new folder') {
            const folderName = await vscode.window.showInputBox({
                prompt: 'Enter new folder name',
                validateInput: value => {
                    if (!value.trim()) return 'Folder name cannot be empty';
                    return null;
                }
            });

            if (!folderName) return undefined;

            const newFolder: NavigatorCategoryItem = {
                label: folderName,
                type: 'folder',
                expanded: true,
                items: [],
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                filePath: ''
            };

            config.categories.push(newFolder);
            return {
                targetItems: newFolder.items,
                location: folderName
            };
        } else {
            // Type guard to ensure folder exists
            if (!selected.folder) {
                vscode.window.showErrorMessage('Invalid folder selection');
                return undefined;
            }

            // Ask if they want to add directly or create subfolder
            const action = await vscode.window.showQuickPick([
                'Add directly here',
                'Create subfolder'
            ], {
                placeHolder: `Add to ${selected.label} or create subfolder?`
            });

            if (!action) return undefined;

            if (action === 'Create subfolder') {
                const subfolderName = await vscode.window.showInputBox({
                    prompt: 'Enter subfolder name',
                    validateInput: value => {
                        if (!value.trim()) return 'Subfolder name cannot be empty';
                        return null;
                    }
                });

                if (!subfolderName) return undefined;

                const newSubfolder: NavigatorCategoryItem = {
                    label: subfolderName,
                    type: 'folder',
                    expanded: true,
                    items: [],
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    filePath: ''
                };

                selected.folder.items.push(newSubfolder);
                return {
                    targetItems: newSubfolder.items,
                    location: `${selected.label}/${subfolderName}`
                };
            } else {
                return {
                    targetItems: selected.folder.items,
                    location: selected.label
                };
            }
        }
    };


    view.title = "F/F Navigator";
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('ocrmnavigatorNavigator.focus');
        }
    }, 1000);
}