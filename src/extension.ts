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
                    "label": "DASHBOARDS",
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



    // Register commands

    context.subscriptions.push(
        // edit json config in viewer
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
        // refresh nav
        vscode.commands.registerCommand('ocrmnavigator.refreshNavigator', () => {
            navigatorProvider.loadConfig();
            vscode.window.showInformationMessage('Navigator refreshed');
        }),
        // reveal in file explorer
        vscode.commands.registerCommand('ocrmnavigator.revealInExplorer', (item: NavigatorItem) => {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(item.filePath));
        }),
        // copy path
        vscode.commands.registerCommand('ocrmnavigator.copyPath', (item: NavigatorItem) => {
            vscode.env.clipboard.writeText(item.filePath);
            vscode.window.showInformationMessage('Path copied to clipboard');
        }),
        // add file to nav
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

                if (!selectedCategory) { return; }

                // Load current config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                let categoryName = selectedCategory;

                // When creating a new category
                if (selectedCategory === '+ Create new category') {
                    categoryName = await vscode.window.showInputBox({
                        prompt: 'Enter new category name',
                        placeHolder: 'e.g. COMPONENTS',
                        validateInput: value => {
                            if (!value.trim()) return 'Category name cannot be empty';
                            if (config.categories.some(c => c.label === value)) {
                                return 'Category already exists';
                            }
                            return null;
                        }
                    }) || '';
                    // User cancelled
                    if (!categoryName) { return; }

                    // Add new category to config
                    config.categories.push({
                        label: categoryName,
                        type: 'folder',
                        expanded: true,
                        items: [],
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        filePath: ''
                    });
                }

                // Find the category
                const category = config.categories.find(c => c.label === categoryName);
                if (!category) {
                    vscode.window.showErrorMessage('Category not found');
                    return;
                }

                // Initialize items array if it doesn't exist
                if (!category.items) {
                    category.items = [];
                }

                // Check for duplicates
                const duplicate = category.items.find(item => item.path === pathOrUrl);
                if (duplicate) {
                    vscode.window.showWarningMessage(`Item already exists in category ${categoryName}`);
                    return;
                }

                // Add the new item
                category.items.push({
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
                vscode.window.showInformationMessage(`Added "${userLabel}" to ${categoryName}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        // Edit file label
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
        // Delete item (file or URL)
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
        // Move category up
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
        // Move category down
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
        // Add new category
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
        // Rename category
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
        // Delete category
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
        // export config from file
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
        // Import config from file
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
        // add url
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

                // Load current config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Prepare category selection
                let categories = config.categories.map(c => c.label);
                categories.push('+ Create new category');

                const selectedCategory = await vscode.window.showQuickPick(categories, {
                    placeHolder: 'Select or create a category'
                });

                if (!selectedCategory) return;

                let categoryName = selectedCategory;

                // Handle new category creation
                if (selectedCategory === '+ Create new category') {
                    categoryName = await vscode.window.showInputBox({
                        prompt: 'Enter new category name',
                        placeHolder: 'e.g. API LINKS'
                    }) || '';

                    if (!categoryName) return;

                    config.categories.push({
                        label: categoryName,
                        type: 'folder',  // Now properly typed
                        expanded: true,
                        items: [],
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        filePath: ''
                    });
                }

                // Find the target category
                const category = config.categories.find(c => c.label === categoryName);
                if (category) {
                    // Check for duplicates
                    const duplicate = category.items?.find(item => item.path === url);
                    if (duplicate) {
                        vscode.window.showWarningMessage(`URL already exists in category ${categoryName}`);
                        return;
                    }

                    // Add the URL bookmark
                    category.items.push({
                        label: label,
                        path: url,
                        type: 'url',
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        filePath: url
                    });

                    // Save and refresh
                    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                    navigatorProvider.loadConfig();
                    vscode.window.showInformationMessage(`Added "${label}" to ${categoryName}`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to add URL: ${error instanceof Error ? error.message : String(error)}`);
            }
        }),
        // edit url
        // edit url
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
        // add cmd
        vscode.commands.registerCommand('ocrmnavigator.addCommand', async () => {
            try {
                const command = await vscode.window.showInputBox({
                    prompt: 'Enter VS Code command ID',
                    placeHolder: 'editor.action.formatDocument',
                    validateInput: value => {
                        if (!value?.trim()) return 'Command cannot be empty';

                        // Basic validation for command format
                        if (!value.includes('.')) {
                            return 'Command should be in format "extension.command"';
                        }

                        // You could add a list of known valid commands here
                        const knownCommands = [
                            'workbench.action.files.saveAll',
                            'editor.action.formatDocument',
                            'editor.foldLevel1'
                            // Add other known commands
                        ];

                        if (!knownCommands.includes(value)) {
                            return 'Warning: This command is not in the known commands list';
                        }

                        return null;
                    }
                });

                if (!command) return;  // User cancelled

                const label = await vscode.window.showInputBox({
                    prompt: 'Enter display label',
                    placeHolder: 'Format Document'
                });

                if (!label) return;

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find or create CMDS category
                let cmdCategory = config.categories.find(c => c.label === 'CMDS');
                if (!cmdCategory) {
                    cmdCategory = {
                        label: 'CMDS',
                        type: 'folder',
                        expanded: true,
                        items: [],
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        filePath: ''
                    };
                    config.categories.push(cmdCategory);
                }

                // Ensure items exists
                if (!cmdCategory.items) {
                    cmdCategory.items = [];
                }

                // Get subcategories under CMDS
                const subcategories = cmdCategory.items
                    .filter((item): item is NavigatorCategoryItem => item.type === 'category')
                    .map(item => item.label);

                const options = [
                    'Add to root CMDS',
                    ...subcategories,
                    '+ Create new subcategory'
                ];

                const placement = await vscode.window.showQuickPick(options, {
                    placeHolder: 'Where should this command be placed?'
                });

                if (!placement) return;

                let targetItems: NavigatorItem[] = cmdCategory.items; // Default to root

                if (placement === '+ Create new subcategory') {
                    const subcategoryName = await vscode.window.showInputBox({
                        prompt: 'Enter new subcategory name',
                        placeHolder: 'e.g. Formatting Commands'
                    });

                    if (!subcategoryName) return;

                    const newSubcategory: NavigatorCategoryItem = {
                        label: subcategoryName,
                        type: 'folder',
                        expanded: true,
                        items: [],
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        filePath: ''
                    };

                    cmdCategory.items.push(newSubcategory);
                    targetItems = newSubcategory.items;
                }
                else if (placement !== 'Add to root CMDS') {
                    const subcategory = cmdCategory.items.find(
                        (item): item is NavigatorCategoryItem =>
                            item.type === 'folder' && item.label === placement
                    );
                    if (subcategory) {
                        targetItems = subcategory.items || [];
                    }
                }

                // Add the command with all required properties
                targetItems.push({
                    label,
                    cmd: command,
                    type: 'command',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Save and refresh
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                navigatorProvider.loadConfig();
                vscode.window.showInformationMessage(
                    `Added command "${label}" to ${placement === 'Add to root CMDS' ? 'CMDS' : placement}`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to add command: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        // Register the command executor
        vscode.commands.registerCommand('ocrmnavigator.executeCommand', (item: NavigatorItem) => {
            vscode.window.showInformationMessage(`Executing cmd: ${item.filePath}`)
            vscode.commands.executeCommand(item.filePath).then(undefined, err => {
                vscode.window.showErrorMessage(
                    `Failed to execute "${item.label}": ${err.message}`
                );
            });
        }),
        // Add subcategory command
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
        // Add command directly to category
        vscode.commands.registerCommand('ocrmnavigator.addCommandToCategory', async (parentItem: NavigatorItem) => {
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

                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find or create CMDS category
                let cmdCategory = config.categories.find(c => c.label === 'CMDS');
                if (!cmdCategory) {
                    cmdCategory = {
                        label: 'CMDS',
                        type: 'folder',
                        expanded: true,
                        items: [],
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        filePath: ''
                    };
                    config.categories.push(cmdCategory);
                }

                // Ensure items exists
                if (!cmdCategory.items) {
                    cmdCategory.items = [];
                }

                // Get subcategories under CMDS
                const subcategories = cmdCategory.items
                    .filter((item): item is NavigatorCategoryItem => item.type === 'folder')
                    .map(item => item.label);

                const options = [
                    'Add to root CMDS',
                    ...subcategories,
                    '+ Create new subcategory'
                ];

                const placement = await vscode.window.showQuickPick(options, {
                    placeHolder: 'Where should this command be placed?'
                });

                if (!placement) return;

                let targetItems: NavigatorItem[] = cmdCategory.items; // Default to root

                if (placement === '+ Create new subcategory') {
                    const subcategoryName = await vscode.window.showInputBox({
                        prompt: 'Enter new subcategory name',
                        placeHolder: 'e.g. Formatting Commands'
                    });

                    if (!subcategoryName) return;

                    const newSubcategory: NavigatorCategoryItem = {
                        label: subcategoryName,
                        type: 'folder',
                        expanded: true,
                        items: [],
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        filePath: ''
                    };

                    cmdCategory.items.push(newSubcategory);
                    targetItems = newSubcategory.items;
                }
                else if (placement !== 'Add to root CMDS') {
                    const subcategory = cmdCategory.items.find(
                        (item): item is NavigatorCategoryItem =>
                            item.type === 'folder' && item.label === placement
                    );
                    if (subcategory) {
                        targetItems = subcategory.items || [];
                    }
                }

                // Add the command with all required properties
                targetItems.push({
                    label,
                    cmd: command,
                    type: 'command',
                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                    filePath: ''
                });

                // Save and refresh
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
                navigatorProvider.loadConfig();
                vscode.window.showInformationMessage(
                    `Added command "${label}" to ${placement === 'Add to root CMDS' ? 'CMDS' : placement}`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to add command: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
        // Toggle folder expansion commands
        vscode.commands.registerCommand('ocrmnavigator.collapseFolder', (item: NavigatorItem) => { updateFolderExpansion(item, false); }),
        vscode.commands.registerCommand('ocrmnavigator.expandFolder', (item: NavigatorItem) => { updateFolderExpansion(item, true); }),
        // create snippets 
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
                const category = await selectOrCreateCategory(config);
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

                const snippetFileName = `${cleanSnippetName}.code-snippets`;
                const snippetPath = path.join(snippetsDir, snippetFileName);

                // Rest of your implementation...
                // [Previous code continues here...]

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),
         // delete snippets 
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
 // edit snippets 
        vscode.commands.registerCommand('ocrmnavigator.editSnippet', async (item: NavigatorItem) => {
            try {
                // Validation checks
                if (!item || item.type !== 'file') {
                    vscode.window.showErrorMessage('Please select a snippet to edit');
                    return;
                }

                if (!item.filePath) {
                    vscode.window.showErrorMessage('Invalid snippet: missing file path');
                    return;
                }

                // Check if it's in the snippets directory
                if (!item.filePath.includes(path.join('.vscode', 'snippets'))) {
                    vscode.window.showErrorMessage('Selected item is not a snippet');
                    return;
                }

                // Check if file exists
                if (!fs.existsSync(item.filePath)) {
                    // Handle case where file might have been deleted outside of VSCode
                    const createNew = await vscode.window.showInformationMessage(
                        `Snippet file not found. Do you want to create it?`,
                        'Yes', 'No'
                    );

                    if (createNew === 'Yes') {
                        // Create empty snippet file with template
                        const snippetName = path.basename(item.filePath, path.extname(item.filePath));
                        const snippetContent =
                            `${snippetName.replace(/\s+/g, '-').toLowerCase()}
        
        // First line above is used for prefix
        // Everything below will be used for the body of the snippet
        // Write your snippet content here
        `;
                        fs.writeFileSync(item.filePath, snippetContent, 'utf8');
                    } else {
                        return;
                    }
                }

                // Open the snippet file
                const doc = await vscode.workspace.openTextDocument(item.filePath);
                await vscode.window.showTextDocument(doc);

                // If it's a new file, move cursor to line 3 (after the prefix line and blank line)
                if (doc.getText().trim().split('\n').length <= 3) {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const position = new vscode.Position(3, 0);
                        editor.selection = new vscode.Selection(position, position);
                        editor.revealRange(new vscode.Range(position, position));
                    }
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to edit snippet: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }),


        view, { dispose: () => view.dispose() }
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

    /**
    * Select an existing category or create a new one
    */
    async function selectOrCreateCategory(config: NavigatorConfig): Promise<NavigatorCategoryItem | undefined> {
        // Get existing categories
        let categories = config.categories.map(c => c.label);

        // Add option to create new
        categories.push('+ Create new category');

        const selectedCategory = await vscode.window.showQuickPick(categories, {
            placeHolder: 'Select or create a category'
        });

        if (!selectedCategory) return undefined;

        let targetCategory: NavigatorCategoryItem;

        // Handle new category creation
        if (selectedCategory === '+ Create new category') {
            const categoryName = await vscode.window.showInputBox({
                prompt: 'Enter new category name',
                placeHolder: 'e.g. COMPONENTS',
                validateInput: value => {
                    if (!value.trim()) return 'Category name cannot be empty';
                    if (config.categories.some(c => c.label === value)) {
                        return 'Category already exists';
                    }
                    return null;
                }
            });

            // User cancelled
            if (!categoryName) return undefined;

            // Add new category to config
            const newCategory: NavigatorCategoryItem = {
                label: categoryName,
                type: 'folder',
                expanded: true,
                items: [],
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                filePath: ''
            };

            config.categories.push(newCategory);
            targetCategory = newCategory;
        } else {
            // Find existing category
            const existingCategory = config.categories.find(c => c.label === selectedCategory);
            if (!existingCategory) return undefined;
            targetCategory = existingCategory;
        }

        // Handle subcategories if needed
        if (targetCategory.items?.length > 0) {
            // Get available subcategories
            const subcategories = targetCategory.items
                .filter((item): item is NavigatorCategoryItem => item.type === 'folder')
                .map(item => item.label);

            if (subcategories.length > 0) {
                const placementOptions = [
                    'Add to current folder',
                    ...subcategories,
                    '+ Create new subfolder'
                ];

                const placement = await vscode.window.showQuickPick(placementOptions, {
                    placeHolder: 'Where should this be placed?'
                });

                if (!placement) return undefined;

                if (placement === '+ Create new subfolder') {
                    const subfolderName = await vscode.window.showInputBox({
                        prompt: 'Enter new subfolder name',
                        placeHolder: 'e.g. Snippets, URLS, docs, ToDo, CMDS, files, etc'
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

                    targetCategory.items.push(newSubfolder);
                    return newSubfolder;
                } else if (placement !== 'Add to current folder') {
                    // Find the selected subcategory
                    const subcategory = targetCategory.items.find(
                        (item): item is NavigatorCategoryItem =>
                            item.type === 'folder' && item.label === placement
                    );

                    if (subcategory) {
                        return subcategory;
                    }
                }
            }
        }

        // Ensure items array exists
        if (!targetCategory.items) {
            targetCategory.items = [];
        }

        return targetCategory;
    }



    // Add status bar button
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(gear) Edit Navigator';
    statusBarItem.tooltip = 'Edit the navigator configuration';
    statusBarItem.command = 'ocrmnavigator.editConfig';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const exportButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    exportButton.text = "$(arrow-down)";
    exportButton.tooltip = "Export configuration";
    exportButton.command = 'ocrmnavigator.exportConfig';
    context.subscriptions.push(exportButton);

    const importButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    importButton.text = "$(arrow-up)";
    importButton.tooltip = "Import configuration";
    importButton.command = 'ocrmnavigator.importConfig';
    context.subscriptions.push(importButton);

    const addCmd = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    importButton.text = "$(terminal)";
    importButton.tooltip = "Add CMD";
    importButton.command = 'ocrmnavigator.addCommandToCategory';
    context.subscriptions.push(addCmd);

    // Add them to the view title
    view.title = "F/F Navigator";
    // Ensure view is visible
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('ocrmnavigatorNavigator.focus');
        }
    }, 1000);
}