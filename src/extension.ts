import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { NavigatorProvider } from './navigatorView';
import { NavigatorItem, NavigatorConfig, NavigatorCategoryItem, NavigatorQuickPickItem } from './func/interface';
import { showContextMenuForItem } from './func/showContextMenuForItem'
import { config } from './func/defaultConfig'
import { registerCommands } from './func/vscodes';
import {    fixTrailingCommas,    getFormatterConfig,    saveFormatterConfig,    formatContent,    formatJson,    sortObjectKeys,    formatJavascript,    formatHtml,    formatCss,} from './func/formatters'




let lastInteractionWasRightClick = false;
let selected

async function showContextMenuForItem1(item: NavigatorItem) { return showContextMenuForItem(item, vscode); }
async function showContextMenu(item: NavigatorItem) { return showContextMenuForItem1(item); }


export function activate(context: vscode.ExtensionContext) {

    /**
    * HELPER function for batch of pushes
    */
    //#region
    // Function to register the webview
    function registerSnippetsWebview(context: vscode.ExtensionContext) {
        let currentPanel: vscode.WebviewPanel | undefined = undefined;

        const command = vscode.commands.registerCommand('ocrmnavigator.openSnippetsWebview', async () => {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

            if (!workspaceRoot) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }

            // If the webview panel already exists, show it
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.One);
                return;
            }

            // Create and show the webview panel
            currentPanel = vscode.window.createWebviewPanel(
                'snippetsWebview',
                'OCRM Navigator - Snippets',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(context.extensionPath, 'media'))
                    ]
                }
            );

            // Load snippets from file
            try {
                const snippetsFilePath = path.join(workspaceRoot, '.vscode/ocrmnavigator.code-snippets');

                if (!fs.existsSync(snippetsFilePath)) {
                    // Create empty snippets file if it doesn't exist
                    fs.mkdirSync(path.dirname(snippetsFilePath), { recursive: true });
                    fs.writeFileSync(snippetsFilePath, '{}', 'utf8');
                }

                const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                const snippets = JSON.parse(snippetsContent);

                // Set webview content
                currentPanel.webview.html = getSnippetsWebviewContent(currentPanel.webview, snippets);

                // Handle messages from the webview
                currentPanel.webview.onDidReceiveMessage(
                    async (message) => {
                        switch (message.command) {
                            case 'editSnippet':
                                vscode.commands.executeCommand('ocrmnavigator.editSnippet', {
                                    label: message.snippetKey,
                                    path: '.vscode/ocrmnavigator.code-snippets'
                                });
                                break;

                            case 'deleteSnippet':
                                try {
                                    const snippetsFilePath = path.join(workspaceRoot, '.vscode/ocrmnavigator.code-snippets');
                                    const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                                    const snippets = JSON.parse(snippetsContent);

                                    if (snippets[message.snippetKey]) {
                                        delete snippets[message.snippetKey];
                                        fs.writeFileSync(snippetsFilePath, JSON.stringify(snippets, null, 2), 'utf8');

                                        // Refresh snippets in webview
                                        currentPanel?.webview.postMessage({
                                            command: 'refreshSnippets',
                                            snippets: Object.entries(snippets).map(([key, data]: [string, any]) => ({
                                                id: key,
                                                title: data.prefix || key,
                                                description: data.description || '',
                                                body: Array.isArray(data.body) ? data.body.join('\n') : data.body || ''
                                            }))
                                        });

                                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                                    }
                                } catch (error) {
                                    vscode.window.showErrorMessage(`Failed to delete snippet: ${error instanceof Error ? error.message : String(error)}`);
                                }
                                break;

                            case 'createSnippet':
                                try {
                                    // Create a placeholder snippet
                                    const snippetsFilePath = path.join(workspaceRoot, '.vscode/ocrmnavigator.code-snippets');
                                    const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                                    const snippets = JSON.parse(snippetsContent);

                                    // Generate a unique snippet key
                                    let baseKey = 'new-snippet';
                                    let snippetKey = baseKey;
                                    let counter = 1;

                                    while (snippets[snippetKey]) {
                                        snippetKey = `${baseKey}-${counter}`;
                                        counter++;
                                    }

                                    // Add the new snippet
                                    snippets[snippetKey] = {
                                        prefix: "New Snippet",
                                        description: "Description for new snippet",
                                        body: ["// Your snippet code here"],
                                        scope: "javascript,typescript"
                                    };

                                    fs.writeFileSync(snippetsFilePath, JSON.stringify(snippets, null, 2), 'utf8');

                                    // Open the snippet for editing
                                    vscode.commands.executeCommand('ocrmnavigator.editSnippet', {
                                        label: snippetKey,
                                        path: '.vscode/ocrmnavigator.code-snippets'
                                    });

                                    // Refresh snippets in webview
                                    currentPanel?.webview.postMessage({
                                        command: 'refreshSnippets',
                                        snippets: Object.entries(snippets).map(([key, data]: [string, any]) => ({
                                            id: key,
                                            title: data.prefix || key,
                                            description: data.description || '',
                                            body: Array.isArray(data.body) ? data.body.join('\n') : data.body || ''
                                        }))
                                    });

                                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                                } catch (error) {
                                    vscode.window.showErrorMessage(`Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`);
                                }
                                break;
                        }
                    },
                    undefined,
                    context.subscriptions
                );

                // Handle panel closure
                currentPanel.onDidDispose(
                    () => {
                        currentPanel = undefined;
                    },
                    null,
                    context.subscriptions
                );

            } catch (error) {
                vscode.window.showErrorMessage(`Failed to load snippets: ${error instanceof Error ? error.message : String(error)}`);
                currentPanel.dispose();
            }
        });

        context.subscriptions.push(command);
    }
    async function showContextMenuForItem() {
        const options = [
            { label: '$(copy) Copy Path', action: 'copy' },
            { label: '$(file-directory) Reveal in Explorer', action: 'reveal' },
            { label: '$(edit) Edit', action: 'edit' },
            { label: '$(edit) Edit Label', action: 'editLabel' },
            { label: '$(trash) Delete', action: 'delete' }
        ];

        const selected = await vscode.window.showQuickPick(options.map(x => x.label), { placeHolder: `Action for ${item.label}` });

        if (selected) {
            const action = options.find(x => x.label === selected)?.action;
            switch (action) {
                case 'copy':
                    if (item.filePath) {
                        if (item.type === 'file') {
                            await vscode.commands.executeCommand('ocrmnavigator.copyPath');
                            await vscode.env.clipboard.writeText(String(item.filePath));
                            return;
                        }
                        if (item.type === 'url') {
                            if (item.path) {
                                await vscode.env.clipboard.writeText(item.path);
                                await vscode.commands.executeCommand('ocrmnavigator.copyPath');
                                return;
                            }
                        }
                        if (item.type === 'command') {
                            if (item.path) {
                                await vscode.env.clipboard.writeText(item.path);
                            }
                            return;
                        }
                        if (item.type === 'folder') {
                            return;
                        }
                        if (item.type === 'md') {
                            await vscode.env.clipboard.writeText(String(item));
                            return;
                        }
                        if (item.type === 'snippet') {
                            await vscode.env.clipboard.writeText(String(item.body));
                            return;
                        }
                        if (item.type === 'powershellCommand') {
                            await vscode.env.clipboard.writeText(String(item.path));
                            return;
                        }
                    }
                    break;
                case 'reveal':
                    if (item.filePath) {
                        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(item.filePath));
                    }
                    break;
                case 'edit':
                    // Implement edit
                    if (item.filePath) {
                        if (item.type === 'file') {
                            await vscode.commands.executeCommand('ocrmnavigator.editFileLabel');
                            return;
                        }
                        if (item.type === 'url') {
                            await vscode.commands.executeCommand('ocrmnavigator.editWebUrl');
                            return;
                        }
                        if (item.type === 'command') {
                            vscode.commands.executeCommand('ocrmnavigator.editCommand');
                            return;
                        }
                        if (item.type === 'folder') {
                            vscode.commands.executeCommand('ocrmnavigator.renameCategory');
                            return;
                        }
                        if (item.type === 'md') {
                            vscode.commands.executeCommand('ocrmnavigator.editMD');
                            return;
                        }
                        if (item.type === 'snippet') {
                            vscode.commands.executeCommand('ocrmnavigator.editSnippet');
                            return;
                        }
                        if (item.type === 'powershellCommand') {
                            vscode.commands.executeCommand('ocrmnavigator.editWebUrl');
                            return;
                        }
                    }
                    break;
                case 'editLabel':
                    // Implement edit
                    if (item.filePath) {
                        if (item.type === 'file') {
                            await vscode.commands.executeCommand('ocrmnavigator.editFileLabel');
                            return;
                        }
                        if (item.type === 'url') {
                            await vscode.commands.executeCommand('ocrmnavigator.editWebUrl');
                            return;
                        }
                        if (item.type === 'command') {
                            vscode.commands.executeCommand('ocrmnavigator.editCommand');
                            return;
                        }
                        if (item.type === 'folder') {
                            vscode.commands.executeCommand('ocrmnavigator.renameCategory');
                            return;
                        }
                        if (item.type === 'md') {
                            vscode.commands.executeCommand('ocrmnavigator.editMDLabel');
                            return;
                        }
                        if (item.type === 'snippet') {
                            vscode.commands.executeCommand('ocrmnavigator.editSnippet');
                            return;
                        }
                        if (item.type === 'powershellCommand') {
                            vscode.commands.executeCommand('ocrmnavigator.editWebUrl');
                            return;
                        }
                    }
                    break;
                case 'delete':
                    if (item.filePath) {
                        if (item.type === 'file') {
                            await vscode.commands.executeCommand('ocrmnavigator.deleteItem');
                            return;
                        }
                        if (item.type === 'command') {
                            await vscode.commands.executeCommand('ocrmnavigator.deleteItem');
                            return;
                        } if (item.type === 'folder') {
                            await vscode.commands.executeCommand('ocrmnavigator.deleteCategory');
                            return;
                        } if (item.type === 'md') {
                            await vscode.commands.executeCommand('ocrmnavigator.removeMD');
                            return;
                        } if (item.type === 'snippet') {
                            await vscode.commands.executeCommand('ocrmnavigator.deleteSnippet');
                            return;
                        } if (item.type && item.type === 'command') {
                            {
                                vscode.commands.executeCommand('ocrmnavigator.removeCommand');
                                return;
                            } if (item.type === 'powershellCommand') {
                                await vscode.commands.executeCommand('ocrmnavigator.removeCommand');
                                return;
                            }
                        }
                        // Implement delete
                        break;
                    }
            }
        }
    }
     //#endregion
    /**
    * HELPER function for batch of pushes
    */
    //#region
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) { vscode.window.showErrorMessage('Please open a workspace folder first'); return; }
    console.log('Workspace root:', workspaceRoot);
    const storagePath = context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath)) { fs.mkdirSync(storagePath, { recursive: true }); }
    const configPath = path.join(storagePath, 'navigator-config.json');
    console.log('Configuration path:', configPath);
    if (!fs.existsSync(configPath)) { const defaultConfig = config; fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2)); }
    const navigatorProvider = new NavigatorProvider(workspaceRoot, configPath);
    const view = vscode.window.createTreeView('ocrmnavigatorNavigator', { treeDataProvider: navigatorProvider, showCollapseAll: true });

    // Path to formatter config file
    const formatterConfigPath = path.join(vscode.workspace.rootPath || '', '.ocrmnavigator', 'formatter-config.json');

    // Register context menu command
    const disposable = vscode.commands.registerCommand('ocrmnavigator.formatCurrentFile', () => {
        vscode.commands.executeCommand('ocrmnavigator.formatCurrentFile');
    });


    //#endregion

    /**
    * HELPER function for snippets
    */
    //#region
    const SNIPPETS_TSX_DIR = path.join('.vscode', 'snippets-tsx');
    const SNIPPETS_DIR = path.join('.vscode');
    interface SnippetDefinition {
        prefix: string;
        body: string[];
        description: string;
        scope: string;
    }
    interface SnippetCollection { [name: string]: SnippetDefinition; }

    async function processSnippetFiles(workspaceRoot: string) {
        const tsxSnippetsPath = path.join(workspaceRoot, SNIPPETS_TSX_DIR);
        const snippetsPath = path.join(workspaceRoot, SNIPPETS_DIR);
        const snippetFilePath = path.join(snippetsPath, 'ocrmnavigator.code-snippets');

        if (!fs.existsSync(tsxSnippetsPath)) { fs.mkdirSync(tsxSnippetsPath, { recursive: true }); }
        if (!fs.existsSync(snippetsPath)) { fs.mkdirSync(snippetsPath, { recursive: true }); }

        let existingSnippets: SnippetCollection = {};
        if (fs.existsSync(snippetFilePath)) {
            try { existingSnippets = JSON.parse(fs.readFileSync(snippetFilePath, 'utf8')) as SnippetCollection; } catch (e) { console.error('Error parsing existing snippets:', e); existingSnippets = {}; }
        }

        const tsxFiles = fs.readdirSync(tsxSnippetsPath).filter(file => file.endsWith('.snippet.tsx'));

        let changed = false;
        for (const tsxFile of tsxFiles) {
            const tsxFilePath = path.join(tsxSnippetsPath, tsxFile);
            const snippetName = path.basename(tsxFile, '.snippet.tsx');

            try {
                const content = fs.readFileSync(tsxFilePath, 'utf8');
                const lines = content.split('\n').filter(line => line.trim() !== '');

                if (lines.length < 1) { vscode.window.showWarningMessage(`Snippet ${tsxFile} needs at least 1 line (prefix)`); continue; }

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

                fs.unlinkSync(tsxFilePath);

            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to process ${tsxFile}: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }

        if (changed) { fs.writeFileSync(snippetFilePath, JSON.stringify(existingSnippets, null, 2)); }
    }
    function setupFileWatcher(workspaceRoot: string) {
        const tsxSnippetsPath = path.join(workspaceRoot, SNIPPETS_TSX_DIR);
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(tsxSnippetsPath, '*.snippet.tsx'));

        watcher.onDidChange(uri => processSnippetFiles(workspaceRoot));
        watcher.onDidCreate(uri => processSnippetFiles(workspaceRoot));
        watcher.onDidDelete(uri => processSnippetFiles(workspaceRoot));
        return watcher;
    }

    processSnippetFiles(workspaceRoot);
    const watcher = setupFileWatcher(workspaceRoot);
    //#endregion
    /**
    * HELPER function for search and its results and its other drop down menu
    */
    //#region
    let itemToMove: NavigatorItem | null = null;

    const quickPick = vscode.window.createQuickPick();
    const options = [
        { label: '$(copy) Copy Path', action: 'copy' },
        { label: '$(file-directory) Reveal in Explorer', action: 'reveal' },
        { label: '$(edit) Edit', action: 'edit' },
        { label: '$(trash) Delete', action: 'delete' }
    ];
    // Add right-click action button to each item
    quickPick.items = options.map(item => ({
        ...item,
        buttons: [{
            iconPath: new vscode.ThemeIcon('ellipsis'),
            tooltip: 'More actions'
        }]
    }));


    if (selected && (selected as NavigatorQuickPickItem).data) {
        // Handle button clicks (right-click alternative)
        quickPick.onDidTriggerItemButton(e => {
            showContextMenu(e.item.data as NavigatorItem);
        });
    }


    const actionBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    actionBtn.text = '$(list-flat) Actions';
    actionBtn.command = 'ocrmnavigator.showActionsMenu';
    actionBtn.tooltip = 'Show OCRMNavigator Actions';
    actionBtn.show();

    context.subscriptions.push(vscode.commands.registerCommand('ocrmnavigator.showActionsMenu', async () => {
        const items = [
            { label: '$(add) Add Folder', command: 'ocrmnavigator.addCategory' },
            { label: '$(terminal) Add Command', command: 'ocrmnavigator.addCommandToCategory' },
            { label: '$(markdown) Create MD', command: 'ocrmnavigator.createMD' },
            { label: '$(markdown) Create MD W Cheat Sheet', command: 'ocrmnavigator.createMD' },
            { label: '$(link) Add URL', command: 'ocrmnavigator.addUrlToNavigator' },
            { label: '$(book) MD Cheat Sheet', command: 'ocrmnavigator.viewMarkdownGuide' },
            { label: '$(book) VSCode CMD Cheat Sheet', command: 'ocrmnavigator.showCommandsReference' },
            { label: '$(gear) Edit Config', command: 'ocrmnavigator.editConfig' },
            { label: '$(arrow-up) Import Config', command: 'ocrmnavigator.importConfig' },
            { label: '$(arrow-down) Export Config', command: 'ocrmnavigator.showCommanexportConfigdsReference' },
            { label: '$(refresh) Refresh', command: 'ocrmnavigator.refresh' }
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an action...'
        });

        if (selected) {
            vscode.commands.executeCommand(selected.command);
        }
    }))

    // Create the search container with input and checkbox
    const searchContainer = vscode.window.createWebviewPanel('ocrmnavigatorSearch', 'Search', vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });

    // Hide the panel initially - we'll use our own UI
    searchContainer.dispose();

    context.subscriptions.push(
        vscode.commands.registerCommand('ocrmnavigator.search', () => {
            const quickPick = vscode.window.createQuickPick<NavigatorQuickPickItem>();
            quickPick.title = "OCRM Navigator Search";
            quickPick.placeholder = 'Type to search...';
            quickPick.ignoreFocusOut = true;

            // Add toggle item
            const toggleItem: NavigatorQuickPickItem = {
                label: "$(file) Search in file contents",
                description: "Toggle this option",
                picked: navigatorProvider.getSearchInFileContents(),
                alwaysShow: true,
                filePath: "" // Add this required property
            };

            // Initial items
            quickPick.items = [toggleItem];

            let searchTimeout: NodeJS.Timeout;
            quickPick.onDidChangeValue(async (text) => {
                clearTimeout(searchTimeout);

                if (text) {
                    searchTimeout = setTimeout(async () => {
                        quickPick.busy = true;
                        try {
                            const results = await navigatorProvider.getQuickPickSearchResults(text);

                            // Transform results with context menu buttons
                            const quickPickItems: NavigatorQuickPickItem[] = results.map(item => ({
                                label: item.label,
                                description: item.description,
                                detail: item.filePath,
                                filePath: item.filePath, // Add this
                                picked: false, // Add these required properties
                                alwaysShow: false,
                                data: item,
                                buttons: [{
                                    iconPath: new vscode.ThemeIcon('ellipsis'),
                                    tooltip: 'More actions'
                                }]
                            }));

                            quickPick.items = [toggleItem, ...quickPickItems];

                        } catch (error) {
                            console.error("Search failed:", error);
                        } finally {
                            quickPick.busy = false;
                        }
                    }, 300);
                } else {
                    quickPick.items = [toggleItem];
                }
            });

            // Handle item button clicks (context menu)
            quickPick.onDidTriggerItemButton(e => {
                showContextMenu(e.item.data as NavigatorItem);

            });

            // Handle item selection (left click/enter)
            quickPick.onDidAccept(() => {
                const selected = quickPick.activeItems[0];
                if (selected && 'data' in selected) {
                    quickPick.hide();
                    navigatorProvider.handleSearchResultSelection(selected.data);
                }
            });

            quickPick.show();
        })
    );
    // Add search button to the view title
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('ocrmnavigatorNavigator', navigatorProvider)
    );

    context.subscriptions.push(
        vscode.window.createTreeView('ocrmnavigatorNavigator', {
            treeDataProvider: navigatorProvider,
            showCollapseAll: true
        })
    );
    //#endregion
    /**
    * HELPER function for snippets
    */
    //#region
    function getSnippetsWebviewContent(webview: vscode.Webview, snippets: Record<string, any>) {
        // Generate unique ID for this webview instance
        const nonce = getNonce();

        // Map snippets to a more usable format for the UI
        const snippetsArray = Object.entries(snippets).map(([key, data]) => {
            return {
                id: key,
                title: data.prefix || key,
                description: data.description || '',
                body: Array.isArray(data.body) ? data.body.join('\n') : data.body || ''
            };
        });

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
            <title>OCRM Navigator Snippets</title>
              <style>
                :root {
                    --background: var(--vscode-editor-background, #1e1e1e);
                    --foreground: var(--vscode-editor-foreground, #d4d4d4);
                    --primary: var(--vscode-button-background, #0e639c);
                    --primary-foreground: var(--vscode-button-foreground, #ffffff);
                    --muted: var(--vscode-editor-inactiveSelectionBackground, #3a3d41);
                    --muted-foreground: var(--vscode-disabledForeground, #888888);
                    --border: var(--vscode-panel-border, #424242);
                    --card: var(--vscode-editorWidget-background, #252526);
                    --card-foreground: var(--vscode-editor-foreground, #d4d4d4);
                    --radius: 6px;
                    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    --font-mono: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    font-family: var(--font-sans);
                    line-height: 1.6;
                    color: var(--foreground);
                    background-color: var(--background);
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-size: 15px;
                }
                
                .container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .header {
                    padding-bottom: 1.5rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    display: inline-block;
                }
                
                .header p {
                    font-size: 1.1rem;
                    color: var(--muted-foreground);
                }
                
                .section {
                    padding: 0.5rem 0 2rem;
                }
                
                .section h2 {
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
                    color: var(--primary-foreground);
                }
                
                .section h3 {
                    font-size: 1.4rem;
                    margin: 1.5rem 0 1rem;
                    color: var(--foreground);
                }
                
                .example-container {
                    background-color: var(--card);
                    border-radius: var(--radius);
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--border);
                }
                
                .example-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid var(--border);
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .example {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 100px;
                }
                
                .code {
                    padding: 1rem;
                    font-family: var(--font-mono);
                    font-size: 0.9rem;
                    white-space: pre-wrap;
                    border-right: 1px solid var(--border);
                    overflow-x: auto;
                }
                
                .preview {
                    padding: 1rem;
                    overflow-x: auto;
                    background-color: var(--background);
                }
                
                .preview h1, .preview h2, .preview h3, 
                .preview h4, .preview h5, .preview h6 {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.2;
                }
                
                .preview h1 {
                    font-size: 2rem;
                }
                
                .preview h2 {
                    font-size: 1.75rem;
                    border-bottom: none;
                    padding-bottom: 0;
                }
                
                .preview h3 {
                    font-size: 1.5rem;
                    margin: 0.5rem 0;
                }
                
                .preview h4 {
                    font-size: 1.25rem;
                }
                
                .preview h5 {
                    font-size: 1rem;
                }
                
                .preview h6 {
                    font-size: 0.875rem;
                }
                
                .preview p {
                    margin-bottom: 1rem;
                }
                
                .preview code {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: var(--font-mono);
                    font-size: 0.85em;
                }
                
                .preview pre {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 1rem;
                    border-radius: var(--radius);
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                
                .preview pre code {
                    background-color: transparent;
                    padding: 0;
                    border-radius: 0;
                    font-size: 0.9em;
                    color: var(--foreground);
                }
                
                .preview ul, .preview ol {
                    padding-left: 2rem;
                    margin-bottom: 1rem;
                }
                
                .preview blockquote {
                    border-left: 4px solid var(--primary);
                    padding: 0.5rem 1rem;
                    margin: 0 0 1rem 0;
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 0 var(--radius) var(--radius) 0;
                }
                
                .preview img {
                    max-width: 100%;
                    border-radius: var(--radius);
                }
                
                .preview table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    border-radius: var(--radius);
                    overflow: hidden;
                }
                
                .preview table th,
                .preview table td {
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                }
                
                .preview table th {
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: 600;
                }
                
                .preview table tr:nth-child(even) {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .preview hr {
                    height: 1px;
                    background-color: var(--border);
                    border: none;
                    margin: 1.5rem 0;
                }
                
                .note {
                    background-color: rgba(var(--primary-rgb, 14, 99, 156), 0.1);
                    border-left: 4px solid var(--primary);
                    padding: 1rem;
                    margin: 1.5rem 0;
                    border-radius: 0 var(--radius) var(--radius) 0;
                }
                
                .note p:last-child {
                    margin-bottom: 0;
                }
                
                .tag {
                    display: inline-block;
                    background-color: var(--primary);
                    color: var(--primary-foreground);
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 9999px;
                    margin-left: 0.5rem;
                }
                
                .tab-container {
                    display: flex;
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 1rem;
                }
                
                .tab {
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    border-bottom: 2px solid transparent;
                }
                
                .tab.active {
                    border-bottom: 2px solid var(--primary);
                    color: var(--primary-foreground);
                }
                
                .expand-btn {
                    background: none;
                    border: none;
                    color: var(--muted-foreground);
                    cursor: pointer;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .expand-btn:hover {
                    color: var(--foreground);
                }
                
                .copy-btn {
                    background: none;
                    border: none;
                    color: var(--muted-foreground);
                    cursor: pointer;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .copy-btn:hover {
                    color: var(--foreground);
                }
                
                .code-annotation {
                    color: #6A9955; /* Green for comments */
                }
                
                /* Additional ShadCN-inspired components */
                .callout {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: var(--radius);
                    background-color: rgba(0, 0, 0, 0.2);
                    border-left: 4px solid var(--primary);
                    margin-bottom: 1rem;
                }
                
                .callout-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                    flex-shrink: 0;
                    margin-top: 0.125rem;
                }
                
                .callout-content {
                    flex: 1;
                }
                
                .callout-title {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                /* Dark mode colors for syntax highlighting */
                .token.comment,
                .token.prolog,
                .token.doctype,
                .token.cdata {
                    color: #6A9955;
                }
                
                .token.punctuation {
                    color: #d4d4d4;
                }
                
                .token.property,
                .token.tag,
                .token.boolean,
                .token.number,
                .token.constant,
                .token.symbol,
                .token.deleted {
                    color: #b5cea8;
                }
                
                .token.selector,
                .token.attr-name,
                .token.string,
                .token.char,
                .token.builtin,
                .token.inserted {
                    color: #ce9178;
                }
                
                .token.operator,
                .token.entity,
                .token.url,
                .language-css .token.string,
                .style .token.string {
                    color: #d4d4d4;
                }
                
                .token.atrule,
                .token.attr-value,
                .token.keyword {
                    color: #569cd6;
                }
                
                .token.function,
                .token.class-name {
                    color: #dcdcaa;
                }
                
                .token.regex,
                .token.important,
                .token.variable {
                    color: #d16969;
                }
                
                /* Table of Contents */
                .toc {
                 
                    top: 2rem;
                    background-color: var(--card);
                    border-radius: var(--radius);
                    padding: 1rem;
                    margin-bottom: 2rem;
                    border: 1px solid var(--border);
                }
                
                .toc-title {
                    font-size: 1.2rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .toc-list {
                    list-style: none;
                    padding-left: 0;
                }
                
                .toc-item {
                    margin-bottom: 0.5rem;
                }
                
                .toc-link {
                    color: var(--foreground);
                    text-decoration: none;
                    display: inline-block;
                    padding: 0.25rem 0;
                    font-size: 0.9rem;
                }
                
                .toc-link:hover {
                    color: var(--primary-foreground);
                }
                
                .toc-list .toc-list {
                    padding-left: 1.5rem;
                    margin-top: 0.5rem;
                }
                
                @media (max-width: 768px) {
                    body {
                        padding: 1rem;
                    }
                    
                    .example {
                        grid-template-columns: 1fr;
                    }
                    
                    .code {
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                }
                    
    .tabs {
        display: flex;
        border-bottom: 1px solid var(--border);
        margin-bottom: 1.5rem;
        overflow-x: auto;
    }
    
    .tab {
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
    }
    
    .tab.active {
        border-bottom: 2px solid var(--primary);
        color: var(--primary-foreground);
        background-color: rgba(var(--primary-rgb, 14, 99, 156), 0.1);
    }
    
    .file-type-options {
        display: none;
    }
    
    .file-type-options.active {
        display: block;
    }
    
    .option-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem;
        border-bottom: 1px solid var(--border);
    }
    
    .option-label {
        flex: 1;
    }
    
    .option-label label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .option-label .description {
        font-size: 0.85rem;
        color: var(--muted-foreground);
    }
    
    .option-input {
        flex: 0 0 auto;
        padding-left: 1rem;
    }
    
    /* Text classes as requested */
    .header-1 {
        text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1];
        font-size: 1.875rem;
        font-weight: bold;
        line-height: 1.2;
        letter-spacing: -0.025em;
    }
    
    .header-2 {
        mt-3 text-muted-foreground text-thin text-center;
        margin-top: 0.75rem;
        color: var(--muted-foreground);
        font-weight: 300;
        text-align: center;
    }
    
    .header-3 {
        font-semibold mb-4 mt-4;
        font-weight: 600;
        margin-bottom: 1rem;
        margin-top: 1rem;
    }
    
    .text-p {
        text-balance font-light text-foreground text-sm text-thin;
        text-wrap: balance;
        font-weight: 300;
        color: var(--foreground);
        font-size: 0.875rem;
    }
    
    #saveButton {
        background-color: var(--primary);
        color: var(--primary-foreground);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-weight: 500;
    }
    
    #saveButton:hover {
        opacity: 0.9;
    }
            </style>
        </head>
        <body id="body">
            <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon" style="display: none;">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            </button>
    
            <div class="container">
                <div class="header">
                    <h1 class="title">OCRM Navigator - Snippets</h1>
                    <p class="description">Search, view, and manage your code snippets</p>
                </div>
    
                <!-- Command Input -->
                <div class="command-wrapper">
                    <input id="command-input" type="text" class="command-input" placeholder="Search snippets..." aria-label="Search snippets">
                    <button id="search-clear" class="search-clear" style="display: none;" aria-label="Clear search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <button id="dropdown-toggle" class="dropdown-toggle" aria-label="Show options">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 9l6 6 6-6"></path>
                        </svg>
                    </button>
    
                    <!-- Commands Dropdown -->
                    <div id="command-dropdown" class="command-dropdown">
                        <!-- Search Results will be here -->
                    </div>
                </div>
    
                <!-- Context Menu -->
                <div id="context-menu" class="context-menu">
                    <div class="context-menu-item" data-action="edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Edit Snippet
                    </div>
                    <div class="context-menu-item" data-action="delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete Snippet
                    </div>
                    <div class="context-menu-item" data-action="new">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        Create New Snippet
                    </div>
                </div>
    
                <!-- Snippet Display -->
                <div id="snippet-display">
                    <div id="loading" class="loading" style="display: none;">
                        <div class="spinner"></div>
                        <span>Loading snippets...</span>
                    </div>
                    <div id="no-snippet-selected" class="no-results">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        <p>Select a snippet to view or use the search to find snippets</p>
                    </div>
                    <div id="no-results" class="no-results" style="display: none;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                        <p>No snippets found matching your search</p>
                    </div>
                    <div id="snippet-content" style="display: none;">
                        <!-- Snippet will be displayed here -->
                    </div>
                </div>
    
                <!-- Actions Bar -->
                <div class="actions-bar">
                    <button id="create-snippet" class="button button-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        Create New Snippet
                    </button>
                </div>
            </div>
    
            <script nonce="${nonce}">
                (function() {
                    const vscode = acquireVsCodeApi();
                    let snippets = ${JSON.stringify(snippetsArray)};
                    let activeSnippet = null;
                    let isDarkTheme = false;
    
                    // DOM Elements
                    const body = document.getElementById('body');
                    const themeToggle = document.getElementById('theme-toggle');
                    const commandInput = document.getElementById('command-input');
                    const commandDropdown = document.getElementById('command-dropdown');
                    const searchClear = document.getElementById('search-clear');
                    const dropdownToggle = document.getElementById('dropdown-toggle');
                    const contextMenu = document.getElementById('context-menu');
                    const loading = document.getElementById('loading');
                    const noSnippetSelected = document.getElementById('no-snippet-selected');
                    const noResults = document.getElementById('no-results');
                    const snippetContent = document.getElementById('snippet-content');
                    const createSnippetBtn = document.getElementById('create-snippet');
                    
                    // Check system theme preference
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        toggleTheme();
                    }
    
                    // Theme Toggle
                    themeToggle.addEventListener('click', toggleTheme);
    
                    function toggleTheme() {
                        isDarkTheme = !isDarkTheme;
                        if (isDarkTheme) {
                            body.classList.add('dark');
                            themeToggle.querySelector('.sun').style.display = 'none';
                            themeToggle.querySelector('.moon').style.display = 'block';
                        } else {
                            body.classList.remove('dark');
                            themeToggle.querySelector('.sun').style.display = 'block';
                            themeToggle.querySelector('.moon').style.display = 'none';
                        }
                    }
    
                    // Initialize UI
                    function initializeUI() {
                        // Populate dropdown with all snippets initially
                        updateDropdownContent('');
                        
                        // Display first snippet or empty state
                        if (snippets.length > 0) {
                            displaySnippet(snippets[0]);
                        } else {
                            showNoSnippetsState();
                        }
                    }
    
                    // Update dropdown content based on search
                    function updateDropdownContent(searchTerm) {
                        let filteredSnippets = snippets;
                        
                        if (searchTerm) {
                            const term = searchTerm.toLowerCase();
                            filteredSnippets = snippets.filter(snippet => 
                                snippet.title.toLowerCase().includes(term) ||
                                snippet.description.toLowerCase().includes(term) ||
                                snippet.body.toLowerCase().includes(term)
                            );
                        }
                        
                        commandDropdown.innerHTML = '';
                        
                        if (filteredSnippets.length === 0) {
                            const noResults = document.createElement('div');
                            noResults.className = 'command-option';
                            noResults.textContent = 'No snippets found';
                            commandDropdown.appendChild(noResults);
                            return;
                        }
                        
                        filteredSnippets.forEach(snippet => {
                            const option = document.createElement('div');
                            option.className = 'command-option';
                            if (activeSnippet && snippet.id === activeSnippet.id) {
                                option.classList.add('active');
                            }
                            
                            const content = document.createElement('div');
                            
                            const title = document.createElement('div');
                            title.className = 'command-option-title';
                            title.textContent = snippet.title;
                            content.appendChild(title);
                            
                            if (snippet.description) {
                                const description = document.createElement('div');
                                description.className = 'command-option-description';
                                description.textContent = snippet.description;
                                content.appendChild(description);
                            }
                            
                            option.appendChild(content);
                            
                            option.dataset.id = snippet.id;
                            option.addEventListener('click', () => {
                                const snippet = snippets.find(s => s.id === option.dataset.id);
                                if (snippet) {
                                    displaySnippet(snippet);
                                    closeDropdown();
                                    commandInput.value = '';
                                    searchClear.style.display = 'none';
                                }
                            });
                            
                            commandDropdown.appendChild(option);
                        });
                    }
    
                    // Display a snippet in the content area
                    function displaySnippet(snippet) {
                        activeSnippet = snippet;
                        noSnippetSelected.style.display = 'none';
                        noResults.style.display = 'none';
                        snippetContent.style.display = 'block';
                        
                        snippetContent.innerHTML = \`
                            <div class="snippet-card">
                                <div class="snippet-header">
                                    <div>
                                        <div class="snippet-title">${escapeHtml(snippet.title)}</div>
                                        ${snippet.description ? `<div class="snippet-description">${escapeHtml(snippet.description)}</div>` : ''}
                                    </div>
                                    <div>
                                        <button class="button button-ghost button-sm snippet-menu-btn" aria-label="Snippet options">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="1"></circle>
                                                <circle cx="12" cy="5" r="1"></circle>
                                                <circle cx="12" cy="19" r="1"></circle>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="snippet-container">
                                    <pre class="snippet-content" tabindex="0" spellcheck="false">${escapeHtml(snippet.body)}</pre>
                                    <button class="copy-button" aria-label="Copy to clipboard">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        <span>Copy</span>
                                    </button>
                                </div>
                            </div>
                        \`;
                        
                        // Add event listeners to snippet content
                        const copyButton = snippetContent.querySelector('.copy-button');
                        copyButton.addEventListener('click', () => {
                            copyToClipboard(snippet.body);
                        });
                        
                        const menuButton = snippetContent.querySelector('.snippet-menu-btn');
                        menuButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showContextMenu(e, snippet);
                        });
                    }
    // Show no snippets state
    function showNoSnippetsState() {
        snippetContent.style.display = 'none';
        noResults.style.display = 'none';
        noSnippetSelected.style.display = 'block';
        activeSnippet = null;
    }
    
    // Show no results state
    function showNoResultsState() {
        snippetContent.style.display = 'none';
        noSnippetSelected.style.display = 'none';
        noResults.style.display = 'block';
        activeSnippet = null;
    }
    
    // Show loading state
    function showLoadingState() {
        snippetContent.style.display = 'none';
        noSnippetSelected.style.display = 'none';
        noResults.style.display = 'none';
        loading.style.display = 'flex';
    }
    
    // Hide loading state
    function hideLoadingState() {
        loading.style.display = 'none';
    }
    
    // Show context menu
    function showContextMenu(event, snippet) {
        const rect = event.target.getBoundingClientRect();
        contextMenu.style.top = \`${rect.bottom + window.scrollY}px\`;
        contextMenu.style.left = \`${rect.left + window.scrollX}px\`;
        contextMenu.classList.add('open');
        
        // Update menu item data attributes with current snippet id
        const menuItems = contextMenu.querySelectorAll('.context-menu-item');
        menuItems.forEach(item => {
            item.dataset.snippetId = snippet.id;
        });
        
        // Prevent closing immediately
        event.stopPropagation();
    }
    
    // Close context menu
    function closeContextMenu() {
        contextMenu.classList.remove('open');
    }
    
    // Show dropdown
    function showDropdown() {
        commandDropdown.classList.add('open');
    }
    
    // Close dropdown
    function closeDropdown() {
        commandDropdown.classList.remove('open');
    }
    
    // Toggle dropdown
    function toggleDropdown() {
        if (commandDropdown.classList.contains('open')) {
            closeDropdown();
        } else {
            updateDropdownContent(commandInput.value);
            showDropdown();
        }
    }
    
    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const copyButton = snippetContent.querySelector('.copy-button');
            const span = copyButton.querySelector('span');
            const originalText = span.textContent;
            
            span.textContent = 'Copied!';
            setTimeout(() => {
                span.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Handle create/edit/delete actions
    function handleSnippetAction(action, snippetId) {
        closeContextMenu();
        
        switch (action) {
            case 'edit':
                const snippetToEdit = snippets.find(s => s.id === snippetId);
                if (snippetToEdit) {
                    vscode.postMessage({
                        command: 'editSnippet',
                        snippetKey: snippetId
                    });
                }
                break;
                
            case 'delete':
                if (confirm('Are you sure you want to delete this snippet?')) {
                    vscode.postMessage({
                        command: 'deleteSnippet',
                        snippetKey: snippetId
                    });
                }
                break;
                
            case 'new':
                vscode.postMessage({
                    command: 'createSnippet'
                });
                break;
        }
    }
    
    // Event Listeners
    commandInput.addEventListener('focus', () => {
        showDropdown();
        updateDropdownContent(commandInput.value);
    });
    
    commandInput.addEventListener('input', (e) => {
        const value = e.target.value;
        updateDropdownContent(value);
        
        if (value) {
            searchClear.style.display = 'block';
            showDropdown();
        } else {
            searchClear.style.display = 'none';
        }
    });
    
    searchClear.addEventListener('click', () => {
        commandInput.value = '';
        searchClear.style.display = 'none';
        updateDropdownContent('');
    });
    
    dropdownToggle.addEventListener('click', toggleDropdown);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle context menu closing
        if (!contextMenu.contains(target) && 
            !target.classList.contains('snippet-menu-btn') && 
            !target.closest('.snippet-menu-btn')) {
            closeContextMenu();
        }
        
        // Handle command dropdown closing
        if (!commandInput.contains(target) && 
            !commandDropdown.contains(target) && 
            !dropdownToggle.contains(target)) {
            closeDropdown();
        }
    });
    
    // Context menu actions
    contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            const snippetId = item.dataset.snippetId;
            handleSnippetAction(action, snippetId);
        });
    });
    
    // Create snippet button
    createSnippetBtn.addEventListener('click', () => {
        handleSnippetAction('new');
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Escape key to close dropdowns
        if (e.key === 'Escape') {
            closeDropdown();
            closeContextMenu();
        }
        
        // Handle up/down arrow keys for dropdown navigation
        if (commandDropdown.classList.contains('open')) {
            const options = Array.from(commandDropdown.querySelectorAll('.command-option'));
            const activeIndex = options.findIndex(opt => opt.classList.contains('active'));
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeIndex < options.length - 1) {
                    options.forEach(opt => opt.classList.remove('active'));
                    options[activeIndex + 1].classList.add('active');
                    options[activeIndex + 1].scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeIndex > 0) {
                    options.forEach(opt => opt.classList.remove('active'));
                    options[activeIndex - 1].classList.add('active');
                    options[activeIndex - 1].scrollIntoView({ block: 'nearest' });
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const activeOption = commandDropdown.querySelector('.command-option.active');
                if (activeOption) {
                    activeOption.click();
                }
            }
        }
    });
    
    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'refreshSnippets':
                snippets = message.snippets;
                updateDropdownContent(commandInput.value);
                
                if (activeSnippet) {
                    const updatedSnippet = snippets.find(s => s.id === activeSnippet.id);
                    if (updatedSnippet) {
                        displaySnippet(updatedSnippet);
                    } else {
                        showNoSnippetsState();
                    }
                } else if (snippets.length > 0) {
                    displaySnippet(snippets[0]);
                } else {
                    showNoSnippetsState();
                }
                break;
                
            case 'showLoading':
                showLoadingState();
                break;
                
            case 'hideLoading':
                hideLoadingState();
                break;
        }
    });
    
    // Make snippet content selectable
    snippetContent.addEventListener('mouseup', () => {
        const selection = window.getSelection();
        if (selection.toString().length > 0) {
            // Enable copy button for selection
            const copyButton = snippetContent.querySelector('.copy-button');
            if (copyButton) {
                copyButton.querySelector('span').textContent = 'Copy Selection';
                copyButton.onclick = () => {
                    copyToClipboard(selection.toString());
                    copyButton.querySelector('span').textContent = 'Copy';
                    copyButton.onclick = () => copyToClipboard(activeSnippet.body);
                };
            }
        }
    });
    
    // Initialize
    initializeUI();
    })();
    
    // Helper function to get VSCode API
    function acquireVsCodeApi() {
    return window.acquireVsCodeApi();
    }
    </script>
    </body>
    </html>`;
    }

    // Helper function to generate a nonce
    function getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    // Function to register the webview
    function registerSnippetsWebview(context: vscode.ExtensionContext) {
        let currentPanel: vscode.WebviewPanel | undefined = undefined;

        const command = vscode.commands.registerCommand('ocrmnavigator.openSnippetsWebview', async () => {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

            if (!workspaceRoot) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }

            // If the webview panel already exists, show it
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.One);
                return;
            }

            // Create and show the webview panel
            currentPanel = vscode.window.createWebviewPanel(
                'snippetsWebview',
                'OCRM Navigator - Snippets',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.file(path.join(context.extensionPath, 'media'))
                    ]
                }
            );

            // Load snippets from file
            try {
                const snippetsFilePath = path.join(workspaceRoot, '.vscode/ocrmnavigator.code-snippets');

                if (!fs.existsSync(snippetsFilePath)) {
                    // Create empty snippets file if it doesn't exist
                    fs.mkdirSync(path.dirname(snippetsFilePath), { recursive: true });
                    fs.writeFileSync(snippetsFilePath, '{}', 'utf8');
                }

                const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                const snippets = JSON.parse(snippetsContent);

                // Set webview content
                currentPanel.webview.html = getSnippetsWebviewContent(currentPanel.webview, snippets);

                // Handle messages from the webview
                currentPanel.webview.onDidReceiveMessage(
                    async (message) => {
                        switch (message.command) {
                            case 'editSnippet':
                                vscode.commands.executeCommand('ocrmnavigator.editSnippet', {
                                    label: message.snippetKey,
                                    path: '.vscode/ocrmnavigator.code-snippets'
                                });
                                break;

                            case 'deleteSnippet':
                                try {
                                    const snippetsFilePath = path.join(workspaceRoot, '.vscode/ocrmnavigator.code-snippets');
                                    const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                                    const snippets = JSON.parse(snippetsContent);

                                    if (snippets[message.snippetKey]) {
                                        delete snippets[message.snippetKey];
                                        fs.writeFileSync(snippetsFilePath, JSON.stringify(snippets, null, 2), 'utf8');

                                        // Refresh snippets in webview
                                        currentPanel?.webview.postMessage({
                                            command: 'refreshSnippets',
                                            snippets: Object.entries(snippets).map(([key, data]: [string, any]) => ({
                                                id: key,
                                                title: data.prefix || key,
                                                description: data.description || '',
                                                body: Array.isArray(data.body) ? data.body.join('\n') : data.body || ''
                                            }))
                                        });

                                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                                    }
                                } catch (error) {
                                    vscode.window.showErrorMessage(`Failed to delete snippet: ${error instanceof Error ? error.message : String(error)}`);
                                }
                                break;

                            case 'createSnippet':
                                try {
                                    // Create a placeholder snippet
                                    const snippetsFilePath = path.join(workspaceRoot, '.vscode/ocrmnavigator.code-snippets');
                                    const snippetsContent = fs.readFileSync(snippetsFilePath, 'utf8');
                                    const snippets = JSON.parse(snippetsContent);

                                    // Generate a unique snippet key
                                    let baseKey = 'new-snippet';
                                    let snippetKey = baseKey;
                                    let counter = 1;

                                    while (snippets[snippetKey]) {
                                        snippetKey = `${baseKey}-${counter}`;
                                        counter++;
                                    }

                                    // Add the new snippet
                                    snippets[snippetKey] = {
                                        prefix: "New Snippet",
                                        description: "Description for new snippet",
                                        body: ["// Your snippet code here"],
                                        scope: "javascript,typescript"
                                    };

                                    fs.writeFileSync(snippetsFilePath, JSON.stringify(snippets, null, 2), 'utf8');

                                    // Open the snippet for editing
                                    vscode.commands.executeCommand('ocrmnavigator.editSnippet', {
                                        label: snippetKey,
                                        path: '.vscode/ocrmnavigator.code-snippets'
                                    });

                                    // Refresh snippets in webview
                                    currentPanel?.webview.postMessage({
                                        command: 'refreshSnippets',
                                        snippets: Object.entries(snippets).map(([key, data]: [string, any]) => ({
                                            id: key,
                                            title: data.prefix || key,
                                            description: data.description || '',
                                            body: Array.isArray(data.body) ? data.body.join('\n') : data.body || ''
                                        }))
                                    });

                                    vscode.commands.executeCommand('ocrmnavigator.refresh');
                                } catch (error) {
                                    vscode.window.showErrorMessage(`Failed to create snippet: ${error instanceof Error ? error.message : String(error)}`);
                                }
                                break;
                        }
                    },
                    undefined,
                    context.subscriptions
                );

                // Handle panel closure
                currentPanel.onDidDispose(
                    () => {
                        currentPanel = undefined;
                    },
                    null,
                    context.subscriptions
                );

            } catch (error) {
                vscode.window.showErrorMessage(`Failed to load snippets: ${error instanceof Error ? error.message : String(error)}`);
                currentPanel.dispose();
            }
        });

        context.subscriptions.push(command);
    }
    //#region
    /**
    * HELPER function for function getMarkdownGuideContent
    */
    //#region

    //#region
    /**
    * HELPER function for function getMarkdownGuideContent
    */
    //#region

    //#region
    /**
    * HELPER function for function getMarkdownGuideContent
    */
    //#region
    function getMarkdownGuideContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Markdown Guide</title>
            <style>
                :root {
                    --background: var(--vscode-editor-background, #1e1e1e);
                    --foreground: var(--vscode-editor-foreground, #d4d4d4);
                    --primary: var(--vscode-button-background, #0e639c);
                    --primary-foreground: var(--vscode-button-foreground, #ffffff);
                    --muted: var(--vscode-editor-inactiveSelectionBackground, #3a3d41);
                    --muted-foreground: var(--vscode-disabledForeground, #888888);
                    --border: var(--vscode-panel-border, #424242);
                    --card: var(--vscode-editorWidget-background, #252526);
                    --card-foreground: var(--vscode-editor-foreground, #d4d4d4);
                    --radius: 6px;
                    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    --font-mono: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    font-family: var(--font-sans);
                    line-height: 1.6;
                    color: var(--foreground);
                    background-color: var(--background);
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-size: 15px;
                }
                
                .container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .header {
                    padding-bottom: 1.5rem;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    display: inline-block;
                }
                
                .header p {
                    font-size: 1.1rem;
                    color: var(--muted-foreground);
                }
                
                .section {
                    padding: 0.5rem 0 2rem;
                }
                
                .section h2 {
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
                    color: var(--primary-foreground);
                }
                
                .section h3 {
                    font-size: 1.4rem;
                    margin: 1.5rem 0 1rem;
                    color: var(--foreground);
                }
                
                .example-container {
                    background-color: var(--card);
                    border-radius: var(--radius);
                    overflow: hidden;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid var(--border);
                }
                
                .example-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid var(--border);
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .example {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    min-height: 100px;
                }
                
                .code {
                    padding: 1rem;
                    font-family: var(--font-mono);
                    font-size: 0.9rem;
                    white-space: pre-wrap;
                    border-right: 1px solid var(--border);
                    overflow-x: auto;
                }
                
                .preview {
                    padding: 1rem;
                    overflow-x: auto;
                    background-color: var(--background);
                }
                
                .preview h1, .preview h2, .preview h3, 
                .preview h4, .preview h5, .preview h6 {
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.2;
                }
                
                .preview h1 {
                    font-size: 2rem;
                }
                
                .preview h2 {
                    font-size: 1.75rem;
                    border-bottom: none;
                    padding-bottom: 0;
                }
                
                .preview h3 {
                    font-size: 1.5rem;
                    margin: 0.5rem 0;
                }
                
                .preview h4 {
                    font-size: 1.25rem;
                }
                
                .preview h5 {
                    font-size: 1rem;
                }
                
                .preview h6 {
                    font-size: 0.875rem;
                }
                
                .preview p {
                    margin-bottom: 1rem;
                }
                
                .preview code {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                    font-family: var(--font-mono);
                    font-size: 0.85em;
                }
                
                .preview pre {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 1rem;
                    border-radius: var(--radius);
                    overflow-x: auto;
                    margin-bottom: 1rem;
                }
                
                .preview pre code {
                    background-color: transparent;
                    padding: 0;
                    border-radius: 0;
                    font-size: 0.9em;
                    color: var(--foreground);
                }
                
                .preview ul, .preview ol {
                    padding-left: 2rem;
                    margin-bottom: 1rem;
                }
                
                .preview blockquote {
                    border-left: 4px solid var(--primary);
                    padding: 0.5rem 1rem;
                    margin: 0 0 1rem 0;
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 0 var(--radius) var(--radius) 0;
                }
                
                .preview img {
                    max-width: 100%;
                    border-radius: var(--radius);
                }
                
                .preview table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    border-radius: var(--radius);
                    overflow: hidden;
                }
                
                .preview table th,
                .preview table td {
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                }
                
                .preview table th {
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: 600;
                }
                
                .preview table tr:nth-child(even) {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .preview hr {
                    height: 1px;
                    background-color: var(--border);
                    border: none;
                    margin: 1.5rem 0;
                }
                
                .note {
                    background-color: rgba(var(--primary-rgb, 14, 99, 156), 0.1);
                    border-left: 4px solid var(--primary);
                    padding: 1rem;
                    margin: 1.5rem 0;
                    border-radius: 0 var(--radius) var(--radius) 0;
                }
                
                .note p:last-child {
                    margin-bottom: 0;
                }
                
                .tag {
                    display: inline-block;
                    background-color: var(--primary);
                    color: var(--primary-foreground);
                    font-size: 0.75rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 9999px;
                    margin-left: 0.5rem;
                }
                
                .tab-container {
                    display: flex;
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 1rem;
                }
                
                .tab {
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    border-bottom: 2px solid transparent;
                }
                
                .tab.active {
                    border-bottom: 2px solid var(--primary);
                    color: var(--primary-foreground);
                }
                
                .expand-btn {
                    background: none;
                    border: none;
                    color: var(--muted-foreground);
                    cursor: pointer;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .expand-btn:hover {
                    color: var(--foreground);
                }
                
                .copy-btn {
                    background: none;
                    border: none;
                    color: var(--muted-foreground);
                    cursor: pointer;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .copy-btn:hover {
                    color: var(--foreground);
                }
                
                .code-annotation {
                    color: #6A9955; /* Green for comments */
                }
                
                /* Additional ShadCN-inspired components */
                .callout {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-radius: var(--radius);
                    background-color: rgba(0, 0, 0, 0.2);
                    border-left: 4px solid var(--primary);
                    margin-bottom: 1rem;
                }
                
                .callout-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                    flex-shrink: 0;
                    margin-top: 0.125rem;
                }
                
                .callout-content {
                    flex: 1;
                }
                
                .callout-title {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                
                /* Dark mode colors for syntax highlighting */
                .token.comment,
                .token.prolog,
                .token.doctype,
                .token.cdata {
                    color: #6A9955;
                }
                
                .token.punctuation {
                    color: #d4d4d4;
                }
                
                .token.property,
                .token.tag,
                .token.boolean,
                .token.number,
                .token.constant,
                .token.symbol,
                .token.deleted {
                    color: #b5cea8;
                }
                
                .token.selector,
                .token.attr-name,
                .token.string,
                .token.char,
                .token.builtin,
                .token.inserted {
                    color: #ce9178;
                }
                
                .token.operator,
                .token.entity,
                .token.url,
                .language-css .token.string,
                .style .token.string {
                    color: #d4d4d4;
                }
                
                .token.atrule,
                .token.attr-value,
                .token.keyword {
                    color: #569cd6;
                }
                
                .token.function,
                .token.class-name {
                    color: #dcdcaa;
                }
                
                .token.regex,
                .token.important,
                .token.variable {
                    color: #d16969;
                }
                
                /* Table of Contents */
                .toc {
                 
                    top: 2rem;
                    background-color: var(--card);
                    border-radius: var(--radius);
                    padding: 1rem;
                    margin-bottom: 2rem;
                    border: 1px solid var(--border);
                }
                
                .toc-title {
                    font-size: 1.2rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border);
                }
                
                .toc-list {
                    list-style: none;
                    padding-left: 0;
                }
                
                .toc-item {
                    margin-bottom: 0.5rem;
                }
                
                .toc-link {
                    color: var(--foreground);
                    text-decoration: none;
                    display: inline-block;
                    padding: 0.25rem 0;
                    font-size: 0.9rem;
                }
                
                .toc-link:hover {
                    color: var(--primary-foreground);
                }
                
                .toc-list .toc-list {
                    padding-left: 1.5rem;
                    margin-top: 0.5rem;
                }
                
                @media (max-width: 768px) {
                    body {
                        padding: 1rem;
                    }
                    
                    .example {
                        grid-template-columns: 1fr;
                    }
                    
                    .code {
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                }
                    
    .tabs {
        display: flex;
        border-bottom: 1px solid var(--border);
        margin-bottom: 1.5rem;
        overflow-x: auto;
    }
    
    .tab {
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        font-size: 0.9rem;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
    }
    
    .tab.active {
        border-bottom: 2px solid var(--primary);
        color: var(--primary-foreground);
        background-color: rgba(var(--primary-rgb, 14, 99, 156), 0.1);
    }
    
    .file-type-options {
        display: none;
    }
    
    .file-type-options.active {
        display: block;
    }
    
    .option-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem;
        border-bottom: 1px solid var(--border);
    }
    
    .option-label {
        flex: 1;
    }
    
    .option-label label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .option-label .description {
        font-size: 0.85rem;
        color: var(--muted-foreground);
    }
    
    .option-input {
        flex: 0 0 auto;
        padding-left: 1rem;
    }
    
    /* Text classes as requested */
    .header-1 {
        text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1];
        font-size: 1.875rem;
        font-weight: bold;
        line-height: 1.2;
        letter-spacing: -0.025em;
    }
    
    .header-2 {
        mt-3 text-muted-foreground text-thin text-center;
        margin-top: 0.75rem;
        color: var(--muted-foreground);
        font-weight: 300;
        text-align: center;
    }
    
    .header-3 {
        font-semibold mb-4 mt-4;
        font-weight: 600;
        margin-bottom: 1rem;
        margin-top: 1rem;
    }
    
    .text-p {
        text-balance font-light text-foreground text-sm text-thin;
        text-wrap: balance;
        font-weight: 300;
        color: var(--foreground);
        font-size: 0.875rem;
    }
    
    #saveButton {
        background-color: var(--primary);
        color: var(--primary-foreground);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-weight: 500;
    }
    
    #saveButton:hover {
        opacity: 0.9;
    }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Markdown Reference Guide</h1>
                    <p>A comprehensive guide to Markdown syntax with side-by-side examples</p>
                </div>
    
                <div class="toc">
                    <div class="toc-title">Table of Contents</div>
                    <ul class="toc-list">
                        <li class="toc-item"><a href="#basics" class="toc-link">Basic Syntax</a></li>
                        <li class="toc-item"><a href="#formatting" class="toc-link">Text Formatting</a></li>
                        <li class="toc-item"><a href="#lists" class="toc-link">Lists</a></li>
                        <li class="toc-item"><a href="#links" class="toc-link">Links & Images</a></li>
                        <li class="toc-item"><a href="#code" class="toc-link">Code</a></li>
                        <li class="toc-item"><a href="#tables" class="toc-link">Tables</a></li>
                        <li class="toc-item"><a href="#blockquotes" class="toc-link">Blockquotes</a></li>
                        <li class="toc-item"><a href="#horizontal" class="toc-link">Horizontal Rules</a></li>
                        <li class="toc-item"><a href="#escaping" class="toc-link">Escaping Characters</a></li>
                        <li class="toc-item"><a href="#advanced" class="toc-link">Advanced Features</a>
                            <ul class="toc-list">
                                <li class="toc-item"><a href="#tasklists" class="toc-link">Task Lists</a></li>
                                <li class="toc-item"><a href="#footnotes" class="toc-link">Footnotes</a></li>
                                <li class="toc-item"><a href="#definition" class="toc-link">Definition Lists</a></li>
                                <li class="toc-item"><a href="#strikethrough" class="toc-link">Strikethrough</a></li>
                                <li class="toc-item"><a href="#emoji" class="toc-link">Emoji</a></li>
                                <li class="toc-item"><a href="#highlight" class="toc-link">Highlighting</a></li>
                                <li class="toc-item"><a href="#subscript" class="toc-link">Subscript & Superscript</a></li>
                            </ul>
                        </li>
                        <li class="toc-item"><a href="#best-practices" class="toc-link">Best Practices</a></li>
                    </ul>
                </div>
    
                <div id="basics" class="section">
                    <h2>Basic Syntax</h2>
                    
                    <h3>Headings</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Headings</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code"># Heading 1
    ## Heading 2
    ### Heading 3
    #### Heading 4
    ##### Heading 5
    ###### Heading 6
    
    Alternative syntax for H1:
    Heading 1
    =========
    
    Alternative syntax for H2:
    Heading 2
    ---------</div>
                            <div class="preview">
                                <h1>Heading 1</h1>
                                <h2>Heading 2</h2>
                                <h3>Heading 3</h3>
                                <h4>Heading 4</h4>
                                <h5>Heading 5</h5>
                                <h6>Heading 6</h6>
                                
                                <p>Alternative syntax for H1:</p>
                                <h1>Heading 1</h1>
                                
                                <p>Alternative syntax for H2:</p>
                                <h2>Heading 2</h2>
                            </div>
                        </div>
                    </div>
    
                    <div class="callout">
                        <div class="callout-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                            </svg>
                        </div>
                        <div class="callout-content">
                            <div class="callout-title">Best Practice</div>
                            <p>Always put a space after the hash symbols in ATX-style headings. For better compatibility, add blank lines before and after headings.</p>
                        </div>
                    </div>
                </div>
    
                <div id="formatting" class="section">
                    <h2>Text Formatting</h2>
                    
                    <h3>Emphasis and Strong</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Bold and Italic</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">*Italic text with asterisks*
    _Italic text with underscores_
    
    **Bold text with asterisks**
    __Bold text with underscores__
    
    ***Bold and italic text***
    ___Bold and italic text___
    **_Bold and italic text_**
    *__Bold and italic text__*</div>
                            <div class="preview">
                                <p><em>Italic text with asterisks</em><br>
                                <em>Italic text with underscores</em></p>
                                <p><strong>Bold text with asterisks</strong><br>
                                <strong>Bold text with underscores</strong></p>
                                <p><strong><em>Bold and italic text</em></strong><br>
                                <strong><em>Bold and italic text</em></strong><br>
                                <strong><em>Bold and italic text</em></strong><br>
                                <strong><em>Bold and italic text</em></strong></p>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div id="lists" class="section">
                    <h2>Lists</h2>
                    
                    <h3>Unordered Lists</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Bullet Points</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">- Item 1
    - Item 2
      - Nested item 2.1
      - Nested item 2.2
    - Item 3
    
    * Alternative syntax
    * Using asterisks
      * Nested item
    * Works the same
    
    + Can also use
    + Plus signs
      + For nesting</div>
                            <div class="preview">
                                <ul>
                                    <li>Item 1</li>
                                    <li>Item 2
                                        <ul>
                                            <li>Nested item 2.1</li>
                                            <li>Nested item 2.2</li>
                                        </ul>
                                    </li>
                                    <li>Item 3</li>
                                </ul>
                                
                                <ul>
                                    <li>Alternative syntax</li>
                                    <li>Using asterisks
                                        <ul>
                                            <li>Nested item</li>
                                        </ul>
                                    </li>
                                    <li>Works the same</li>
                                </ul>
                                
                                <ul>
                                    <li>Can also use</li>
                                    <li>Plus signs
                                        <ul>
                                            <li>For nesting</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Ordered Lists</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Numbered Lists</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">1. First item
    2. Second item
       1. Nested item 2.1
       2. Nested item 2.2
    3. Third item
    
    1. Numbers don't
    1. Actually matter
    1. Markdown will
    1. Count for you
    
    42. You can start at
    43. Any number</div>
                            <div class="preview">
                                <ol>
                                    <li>First item</li>
                                    <li>Second item
                                        <ol>
                                            <li>Nested item 2.1</li>
                                            <li>Nested item 2.2</li>
                                        </ol>
                                    </li>
                                    <li>Third item</li>
                                </ol>
                                
                                <ol>
                                    <li>Numbers don't</li>
                                    <li>Actually matter</li>
                                    <li>Markdown will</li>
                                    <li>Count for you</li>
                                </ol>
                                
                                <ol start="42">
                                    <li>You can start at</li>
                                    <li>Any number</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Mixed Lists</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Combining List Types</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">1. First ordered item
    2. Second ordered item
       - Unordered sub-item
       - Another unordered sub-item
    3. Third ordered item
       1. Ordered sub-item
       2. Another ordered sub-item</div>
                            <div class="preview">
                                <ol>
                                    <li>First ordered item</li>
                                    <li>Second ordered item
                                        <ul>
                                            <li>Unordered sub-item</li>
                                            <li>Another unordered sub-item</li>
                                        </ul>
                                    </li>
                                    <li>Third ordered item
                                        <ol>
                                            <li>Ordered sub-item</li>
                                            <li>Another ordered sub-item</li>
                                        </ol>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div id="links" class="section">
                    <h2>Links & Images</h2>
                    
                    <h3>Links</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Hyperlinks</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">[Basic link](https://www.example.com)
    
    [Link with title](https://www.example.com "Example Website")
    
    <https://www.example.com> (Automatic URL linking)
    
    [Reference-style link][reference]
    
    [reference]: https://www.example.com "Optional Title"
    
    [Relative link to a file](../path/to/file.md)
    
    [Link to heading](#headings)</div>
                            <div class="preview">
                                <p><a href="https://www.example.com">Basic link</a></p>
                                <p><a href="https://www.example.com" title="Example Website">Link with title</a></p>
                                <p><a href="https://www.example.com">https://www.example.com</a> (Automatic URL linking)</p>
                                <p><a href="https://www.example.com" title="Optional Title">Reference-style link</a></p>
                                <p><a href="../path/to/file.md">Relative link to a file</a></p>
                                <p><a href="#headings">Link to heading</a></p>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Images</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Embedding Images</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">![Alt text for the image](https://via.placeholder.com/150)
    
    ![Alt text with title](https://via.placeholder.com/150 "Image Title")
    
    [![Clickable image](https://via.placeholder.com/150)](https://www.example.com)
    
    [Reference style image]![reference image]
    
    ![reference image]: https://via.placeholder.com/150</div>
                            <div class="preview">
                                <p><img src="https://via.placeholder.com/150" alt="Alt text for the image"></p>
                                <p><img src="https://via.placeholder.com/150" alt="Alt text with title" title="Image Title"></p>
                                <p><a href="https://www.example.com"><img src="https://via.placeholder.com/150" alt="Clickable image"></a></p>
                                <p>Reference style images work similarly to reference links</p>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div id="code" class="section">
                    <h2>Code</h2>
                    
                    <h3>Inline Code</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Inline Code</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">Use the \`print()\` function to display output.
    
    The HTML tag \`<section>\` defines a section in a document.</div>
                            <div class="preview">
                                <p>Use the <code>print()</code> function to display output.</p>
                                <p>The HTML tag <code>&lt;section&gt;</code> defines a section in a document.</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Code Blocks</h3>
                    <div class="example-container">
                        <div class="example-header">
                            <span>Code Blocks with Syntax Highlighting</span>
                            <button class="copy-btn">Copy</button>
                        </div>
                        <div class="example">
                            <div class="code">\`\`\`python
    def hello_world():
        print("Hello, world!")
        return True
    
    if __name__ == "__main__":
        hello_world()
    \`\`\`
    
    \`\`\`javascript
    function helloWorld() {
        console.log("Hello, world!");
        return true;
    }
    
    helloWorld();
    \`\`\`
    
    \`\`\`css
    body {
        font-family: sans-serif;
        line-height: 1.6;
        color: #333;
    }
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
    \`\`\`
    
    Indented code block (4 spaces or 1 tab):
    
        This is a code block.
        No syntax highlighting.
        Used for plain text.</div>
                            <div class="preview">
                                <pre><code class="language-python">def hello_world():
        print("Hello, world!")
        return True
    
    if __name__ == "__main__":
        hello_world()</code></pre>
                                <pre><code class="language-javascript">function helloWorld() {
        console.log("Hello, world!");
        return true;
    }
    
    helloWorld();</code></pre>
                                <pre><code class="language-css">body {
        font-family: sans-serif;
        line-height: 1.6;
        color: #333;
    }
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }</code></pre>
                                <p>Indented code block (4 spaces or 1 tab):</p>
                                <pre><code>This is a code block.
    No syntax highlighting.
    Used for plain text.</code></pre>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div id="tables" class="section">
    <h2>Tables</h2>
    
    <div class="example-container">
        <div class="example-header">
            <span>Basic Tables</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">| Header 1 | Header 2 | Header 3 |
    | -------- | -------- | -------- |
    | Cell 1   | Cell 2   | Cell 3   |
    | Cell 4   | Cell 5   | Cell 6   |
    
    | Left-aligned | Center-aligned | Right-aligned |
    | :----------- | :-----------: | ------------: |
    | Left         | Center        | Right         |
    | Text         | Text          | Text          |</div>
            <div class="preview">
                <table>
                    <thead>
                        <tr>
                            <th>Header 1</th>
                            <th>Header 2</th>
                            <th>Header 3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Cell 1</td>
                            <td>Cell 2</td>
                            <td>Cell 3</td>
                        </tr>
                        <tr>
                            <td>Cell 4</td>
                            <td>Cell 5</td>
                            <td>Cell 6</td>
                        </tr>
                    </tbody>
                </table>
                
                <table>
                    <thead>
                        <tr>
                            <th style="text-align:left">Left-aligned</th>
                            <th style="text-align:center">Center-aligned</th>
                            <th style="text-align:right">Right-aligned</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align:left">Left</td>
                            <td style="text-align:center">Center</td>
                            <td style="text-align:right">Right</td>
                        </tr>
                        <tr>
                            <td style="text-align:left">Text</td>
                            <td style="text-align:center">Text</td>
                            <td style="text-align:right">Text</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="callout">
        <div class="callout-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
            </svg>
        </div>
        <div class="callout-content">
            <div class="callout-title">Table Tips</div>
            <p>Outer pipes (|) at the beginning and end of rows are optional. Cells don't have to line up perfectly in your raw Markdown. Each header cell must have at least three dashes (---) in the separator row.</p>
        </div>
    </div>
    </div>
    
    <div id="blockquotes" class="section">
    <h2>Blockquotes</h2>
    
    <div class="example-container">
        <div class="example-header">
            <span>Blockquotes</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">> This is a blockquote
    > 
    > It can span multiple lines
    
    > Blockquotes can be nested
    >> Like this
    >>> And this
    
    > ### Blockquotes can contain other Markdown elements
    > 
    > - Lists
    > - **Bold text**
    > - \\\`Code\\\`</div>
            <div class="preview">
                <blockquote>
                    <p>This is a blockquote</p>
                    <p>It can span multiple lines</p>
                </blockquote>
                
                <blockquote>
                    <p>Blockquotes can be nested</p>
                    <blockquote>
                        <p>Like this</p>
                        <blockquote>
                            <p>And this</p>
                        </blockquote>
                    </blockquote>
                </blockquote>
                
                <blockquote>
                    <h3>Blockquotes can contain other Markdown elements</h3>
                    <ul>
                        <li>Lists</li>
                        <li><strong>Bold text</strong></li>
                        <li><code>Code</code></li>
                    </ul>
                </blockquote>
            </div>
        </div>
    </div>
    </div>
    
    <div id="horizontal" class="section">
    <h2>Horizontal Rules</h2>
    
    <div class="example-container">
        <div class="example-header">
            <span>Horizontal Rules</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">Three or more hyphens:
    
    ---
    
    Three or more asterisks:
    
    ***
    
    Three or more underscores:
    
    ___</div>
            <div class="preview">
                <p>Three or more hyphens:</p>
                <hr>
                
                <p>Three or more asterisks:</p>
                <hr>
                
                <p>Three or more underscores:</p>
                <hr>
            </div>
        </div>
    </div>
    </div>
    
    <div id="escaping" class="section">
    <h2>Escaping Characters</h2>
    
    <div class="example-container">
        <div class="example-header">
            <span>Escaping Special Characters</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">Use a backslash (\\) to escape Markdown formatting:
    
    \*This text is not in italics\*
    
    \# This is not a heading
    
    1\. This is not a list item
    
    Escaped backslash: \\\
    
    Characters you may need to escape:
    \\ backslash
    \` backtick
    \* asterisk
    \_ underscore
    \{ \} curly braces
    \[ \] square brackets
    \( \) parentheses
    \# hash symbol
    \+ plus sign
    \- minus sign (hyphen)
    \. period
    \! exclamation mark</div>
            <div class="preview">
                <p>Use a backslash (\) to escape Markdown formatting:</p>
                
                <p>*This text is not in italics*</p>
                
                <p># This is not a heading</p>
                
                <p>1. This is not a list item</p>
                
                <p>Escaped backslash: \</p>
                
                <p>Characters you may need to escape:
                \ backslash
                \\\` backtick
                * asterisk
                _ underscore
                { } curly braces
                [ ] square brackets
                ( ) parentheses
                # hash symbol
                + plus sign
                - minus sign (hyphen)
                . period
                ! exclamation mark</p>
            </div>
        </div>
    </div>
    </div>
    
    <div id="advanced" class="section">
    <h2>Advanced Features</h2>
    <p>These features are available in GitHub Flavored Markdown (GFM) and many other Markdown processors, but might not be supported everywhere.</p>
    
    <div id="tasklists" class="example-container">
        <div class="example-header">
            <span>Task Lists</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">- [x] Completed task
    - [ ] Uncompleted task
    - [ ] Task with nested items
    - [x] Completed nested task
    - [ ] Uncompleted nested task</div>
            <div class="preview">
                <ul class="contains-task-list">
                    <li class="task-list-item"><input type="checkbox" disabled checked> Completed task</li>
                    <li class="task-list-item"><input type="checkbox" disabled> Uncompleted task</li>
                    <li class="task-list-item"><input type="checkbox" disabled> Task with nested items
                        <ul class="contains-task-list">
                            <li class="task-list-item"><input type="checkbox" disabled checked> Completed nested task</li>
                            <li class="task-list-item"><input type="checkbox" disabled> Uncompleted nested task</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    
    <div id="footnotes" class="example-container">
        <div class="example-header">
            <span>Footnotes</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">Here is a sentence with a footnote[^1].
    
    Later in the document:
    
    [^1]: This is the footnote content.
    
    You can also use inline footnotes^[like this one] directly in the text.</div>
            <div class="preview">
                <p>Here is a sentence with a footnote<sup><a href="#fn1" id="ref1">[1]</a></sup>.</p>
                
                <p>Later in the document:</p>
                
                <div class="footnotes">
                    <hr>
                    <ol>
                        <li id="fn1">This is the footnote content. <a href="#ref1">↩</a></li>
                    </ol>
                </div>
                
                <p>You can also use inline footnotes<sup>[2]</sup> directly in the text.</p>
                
                <div class="footnotes">
                    <hr>
                    <ol start="2">
                        <li>like this one</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    
    <div id="definition" class="example-container">
        <div class="example-header">
            <span>Definition Lists</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">Markdown
    : A lightweight markup language with plain-text formatting syntax.
    
    HTML
    : The standard markup language for documents designed to be displayed in a web browser.
    : It stands for Hyper Text Markup Language.</div>
            <div class="preview">
                <dl>
                    <dt>Markdown</dt>
                    <dd>A lightweight markup language with plain-text formatting syntax.</dd>
                    
                    <dt>HTML</dt>
                    <dd>The standard markup language for documents designed to be displayed in a web browser.</dd>
                    <dd>It stands for Hyper Text Markup Language.</dd>
                </dl>
            </div>
        </div>
    </div>
    
    <div id="strikethrough" class="example-container">
        <div class="example-header">
            <span>Strikethrough</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">~~This text is crossed out~~
    
    ~~**Bold and crossed out**~~</div>
            <div class="preview">
                <p><del>This text is crossed out</del></p>
                
                <p><del><strong>Bold and crossed out</strong></del></p>
            </div>
        </div>
    </div>
    
    <div id="emoji" class="example-container">
        <div class="example-header">
            <span>Emoji</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">GitHub supports emoji shortcodes:
    
    :smile: :heart: :thumbsup: :rocket: :tada:
    
    Regular Unicode emoji also work:
    
    🙂 ❤️ 👍 🚀 🎉</div>
            <div class="preview">
                <p>GitHub supports emoji shortcodes:</p>
                
                <p>😄 ❤️ 👍 🚀 🎉</p>
                
                <p>Regular Unicode emoji also work:</p>
                
                <p>🙂 ❤️ 👍 🚀 🎉</p>
            </div>
        </div>
    </div>
    
    <div id="highlight" class="example-container">
        <div class="example-header">
            <span>Highlighting</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">Some Markdown processors support ==highlighting== text.</div>
            <div class="preview">
                <p>Some Markdown processors support <mark>highlighting</mark> text.</p>
            </div>
        </div>
    </div>
    
    <div id="subscript" class="example-container">
        <div class="example-header">
            <span>Subscript & Superscript</span>
            <button class="copy-btn">Copy</button>
        </div>
        <div class="example">
            <div class="code">H~2~O (subscript)
    
    X^2^ (superscript)</div>
            <div class="preview">
                <p>H<sub>2</sub>O (subscript)</p>
                
                <p>X<sup>2</sup> (superscript)</p>
            </div>
        </div>
    </div>
    </div>
    
    <div id="best-practices" class="section">
    <h2>Best Practices</h2>
    
    <div class="callout">
        <div class="callout-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
            </svg>
        </div>
        <div class="callout-content">
            <div class="callout-title">General Tips</div>
            <ul>
                <li>Use consistent style for headings, lists, and emphasis</li>
                <li>Add blank lines between blocks of text for better readability</li>
                <li>Use reference links for URLs you reference multiple times</li>
                <li>Break long lines for better readability in the raw Markdown</li>
                <li>Include a table of contents for longer documents</li>
                <li>Preview your Markdown before publishing to check formatting</li>
            </ul>
        </div>
    </div>
    
    <div class="callout">
        <div class="callout-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
            </svg>
        </div>
        <div class="callout-content">
            <div class="callout-title">Common Mistakes</div>
            <ul>
                <li>Forgetting to add blank lines before and after blocks (lists, code blocks, etc.)</li>
                <li>Not indenting nested elements properly</li>
                <li>Using tabs instead of spaces for indentation (can cause inconsistent rendering)</li>
                <li>Forgetting to escape special characters when needed</li>
                <li>Not using code blocks for code snippets</li>
            </ul>
        </div>
    </div>
    </div>
    
    <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border); text-align: center; color: var(--muted-foreground);">
    <p>This comprehensive Markdown guide is designed to help you master Markdown syntax.</p>
    </footer>
    
    </div>
    </body>
    </html>`
    }
    //#region
    /**
  * HELPER function for search and its results and its other drop down menu
  */
    //#region
    const commandDisposables = registerCommands(context, dependencies);
    context.subscriptions.push(
        ...commandDisposables,
        watcher,
        view,
        { dispose: () => view.dispose() });
    //#endregion

    view.title = "F/F Navigator";
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('ocrmnavigatorNavigator.focus');
        }
    }, 1000);
}


export function activate(context: vscode.ExtensionContext) {
    // Register command for manual sync
    const syncCommand = vscode.commands.registerCommand('notes-sync.sync', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            syncNotes(workspaceFolders[0].uri.fsPath);
        }
    });


    // Initial sync when extension activates
    if (vscode.workspace.workspaceFolders) {
        syncNotes(vscode.workspace.workspaceFolders[0].uri.fsPath);
    }

    context.subscriptions.push(syncCommand, watcher);
}

async function syncNotes(workspacePath: string) {
    try {
        const git = simplegit(workspacePath);

        // First pull to get remote changes
        await git.fetch();
        const status = await git.status();

        if (status.behind > 0) {
            // Remote has changes, pull them
            await git.pull();
            vscode.window.showInformationMessage('Notes synchronized from mobile');
        }

        // Handle local changes
        if (status.files.length > 0) {
            await git.add('.');
            await git.commit('Update notes from VS Code');
            await git.push();
            vscode.window.showInformationMessage('Notes pushed to remote');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Sync failed: ${error.message}`);
    }
}