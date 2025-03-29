import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NavigatorProvider, NavigatorItem } from './navigatorView';

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
        vscode.commands.registerCommand('opinionatedCrm.refreshNavigator', () => {
            navigatorProvider.loadConfig();
            vscode.window.showInformationMessage('Navigator refreshed');
        }),
        vscode.commands.registerCommand('opinionatedCrm.revealInExplorer', (item: NavigatorItem) => {
            vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(item.filePath));
        }),
        vscode.commands.registerCommand('opinionatedCrm.copyPath', (item: NavigatorItem) => {
            vscode.env.clipboard.writeText(item.filePath);
            vscode.window.showInformationMessage('Path copied to clipboard');
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

    // Ensure view is visible
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('opinionatedCrmNavigator.focus');
        }
    }, 1000);
}