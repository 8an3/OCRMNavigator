import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NavigatorProvider, NavigatorItem, NavigatorConfig } from './navigatorView';

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
                    "label": "DASHBOARDS",
                    "expanded": true,
                    "items": [
                        {
                            "label": "Admin Dashboard",
                            "path": "apps/app/app/routes/portal/$dept/settings/general.tsx"
                        },
                        {
                            "label": "Client Dashboard",
                            "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx"
                        }
                    ]
                },
                {
                    "label": "RELATED LINKS",
                    "expanded": false,
                    "items": [
                        {
                            "label": "client.website",
                            "path": "apps/app/app/routes/dealer/client/home.tsx"
                        }
                    ]
                },
                {
                    "label": "COMPONENTS",
                    "expanded": false,
                    "items": [
                        {
                            "label": "app.sidebar",
                            "path": "apps/app/app/routes/__component/appSidebar.tsx"
                        }
                    ]
                },
                {
                    "label": "UTILS",
                    "expanded": false,
                    "items": [
                        {
                            "label": "loader.server",
                            "path": "apps/app/app/utils/loader.server.tsx"
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
    const view = vscode.window.createTreeView('opinionatedCrmNavigator', {
        treeDataProvider: navigatorProvider,
        showCollapseAll: true
    });

    // Register commands

    context.subscriptions.push(
        // edit json config in viewer
        vscode.commands.registerCommand('opinionatedCrm.editConfig', async () => {
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
        // refresh nav
        vscode.commands.registerCommand('opinionatedCrm.refreshNavigator', () => {
            navigatorProvider.loadConfig();
            vscode.window.showInformationMessage('Navigator refreshed');
        }),
        // reveal in file explorer
        vscode.commands.registerCommand('opinionatedCrm.revealInExplorer', (item: NavigatorItem) => {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(item.filePath));
        }),
        // copy path
        vscode.commands.registerCommand('opinionatedCrm.copyPath', (item: NavigatorItem) => {
            vscode.env.clipboard.writeText(item.filePath);
            vscode.window.showInformationMessage('Path copied to clipboard');
        }),
        // add file to nav
        vscode.commands.registerCommand('opinionatedCrm.addFileToNavigator', async (fileUri: vscode.Uri) => {
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

                // Choose a category
                let categories: string[] = [];
                if (navigatorProvider.config && navigatorProvider.config.categories) {
                    categories = navigatorProvider.config.categories.map(c => c.label);
                }

                // Add option to create a new category
                categories.push('+ Create new category');

                const selectedCategory = await vscode.window.showQuickPick(categories, {
                    placeHolder: 'Select or create a category'
                });

                if (!selectedCategory) {
                    return; // User cancelled
                }

                // Load current config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                let categoryName = selectedCategory;

                // Handle creating a new category
                if (selectedCategory === '+ Create new category') {
                    categoryName = await vscode.window.showInputBox({
                        prompt: 'Enter new category name',
                        placeHolder: 'e.g. COMPONENTS'
                    }) || '';

                    if (!categoryName) {
                        return; // User cancelled
                    }

                    // Add new category to config
                    config.categories.push({
                        label: categoryName,
                        expanded: true,
                        items: []
                    });
                }

                // Find the category and add the file
                const category = config.categories.find(c => c.label === categoryName);
                if (category) {
                    // Check for duplicates
                    const duplicate = category.items.find(item => item.path === relativePath);
                    if (duplicate) {
                        vscode.window.showWarningMessage(`File already exists in category ${categoryName}`);
                        return;
                    }

                    category.items.push({
                        label: userLabel,
                        path: relativePath
                    });

                    // Save updated config
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                    // Refresh the view
                    navigatorProvider.loadConfig();
                    vscode.window.showInformationMessage(`Added "${userLabel}" to ${categoryName}`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        // Edit file label
        vscode.commands.registerCommand('opinionatedCrm.editFileLabel', async (item: NavigatorItem) => {
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
                    const fileIndex = category.items.findIndex(
                        fileItem => path.join(workspaceRoot, fileItem.path) === item.filePath
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
        // Delete file
        vscode.commands.registerCommand('opinionatedCrm.deleteFile', async (item: NavigatorItem) => {
            if (!item || item.type !== 'file') {
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

                // Find and remove the file
                let fileRemoved = false;
                for (const category of config.categories) {
                    const fileIndex = category.items.findIndex(
                        fileItem => path.join(workspaceRoot, fileItem.path) === item.filePath
                    );

                    if (fileIndex >= 0) {
                        // Remove file
                        category.items.splice(fileIndex, 1);
                        fileRemoved = true;

                        // Save config
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                        // Refresh view
                        navigatorProvider.loadConfig();
                        vscode.window.showInformationMessage(`Removed "${item.label}" from navigator`);
                        break;
                    }
                }

                if (!fileRemoved) {
                    vscode.window.showWarningMessage('File not found in navigator configuration');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to remove file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        // Move category up
        vscode.commands.registerCommand('opinionatedCrm.moveCategoryUp', async (item: NavigatorItem) => {
            if (!item || item.type !== 'category') {
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
        // Move category down
        vscode.commands.registerCommand('opinionatedCrm.moveCategoryDown', async (item: NavigatorItem) => {
            if (!item || item.type !== 'category') {
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
        // Add new category
        vscode.commands.registerCommand('opinionatedCrm.addCategory', async () => {
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

                // Add new category
                config.categories.push({
                    label: categoryName,
                    expanded: true,
                    items: []
                });

                // Save config
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

                // Refresh view
                navigatorProvider.loadConfig();
                vscode.window.showInformationMessage(`Added category "${categoryName}"`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add category: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        // Rename category
        vscode.commands.registerCommand('opinionatedCrm.renameCategory', async (item: NavigatorItem) => {
            if (!item || item.type !== 'category') {
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
        // Delete category
        vscode.commands.registerCommand('opinionatedCrm.deleteCategory', async (item: NavigatorItem) => {
            if (!item || item.type !== 'category') {
                return;
            }

            try {
                // Read config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find category
                const categoryIndex = config.categories.findIndex(c => c.label === item.label);
                if (categoryIndex < 0) {
                    return;
                }

                // Count items in category
                const itemCount = config.categories[categoryIndex].items.length;

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
        // export config from file
        vscode.commands.registerCommand('opinionatedCrm.exportConfig', async () => {
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
        // Import config from file
        vscode.commands.registerCommand('opinionatedCrm.importConfig', async () => {
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
        view,
        {
            dispose: () => view.dispose()
        }
    );

    // Add status bar button
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(gear) Edit Navigator';
    statusBarItem.tooltip = 'Edit the navigator configuration';
    statusBarItem.command = 'opinionatedCrm.editConfig';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const exportButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    exportButton.text = "$(arrow-down)";
    exportButton.tooltip = "Export configuration";
    exportButton.command = 'opinionatedCrm.exportConfig';
    context.subscriptions.push(exportButton);
    
    const importButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    importButton.text = "$(arrow-up)";
    importButton.tooltip = "Import configuration";
    importButton.command = 'opinionatedCrm.importConfig';
    context.subscriptions.push(importButton);
    
    // Add them to the view title
    view.title = "F/F Navigator";
    // Ensure view is visible
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('opinionatedCrmNavigator.focus');
        }
    }, 1000);
}