import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import { NavigatorProvider } from './navigatorView';
import { NavigatorItem, NavigatorConfig, NavigatorCategoryItem, NavigatorQuickPickItem } from './func/interface';
import { getMarkdownGuideContent } from './func/markdownguid'
import { showContextMenuForItem } from './func/showContextMenuForItem'
import { config } from './func/defaultConfig'
import { registerCommands } from './func/vscodes';

let lastInteractionWasRightClick = false;
let selected

async function showContextMenuForItem1(item: NavigatorItem) { return showContextMenuForItem(item, vscode); }
async function showContextMenu(item: NavigatorItem) { return showContextMenuForItem1(item); }


export function activate(context: vscode.ExtensionContext) {
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
    * HELPER function for search and its results and its other drop down menu
    */
    //#region
        const commandDisposables = registerCommands(context, dependencies);
    context.subscriptions.push(
        ...commandDisposables,
        watcher, 
        view, 
        { dispose: () => view.dispose() } );
    //#endregion

    view.title = "F/F Navigator";
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('ocrmnavigatorNavigator.focus');
        }
    }, 1000);
}