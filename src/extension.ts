import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { NavigatorProvider, NavigatorItem, NavigatorConfig, NavigatorCategoryItem } from './navigatorView';
import * as os from 'os';

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
                            "label": "VSCode Commands Reference",
                            "path": "command:ocrmnavigator.showCommandsReference",
                            "type": "command"
                        },
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
                    background: linear-gradient(to right, var(--primary-foreground), var(--primary));
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
    // Initial processing
    processSnippetFiles(workspaceRoot);
    // Set up watcher
    const watcher = setupFileWatcher(workspaceRoot);


    let itemToMove: NavigatorItem | null = null;
    function executeTerminalCommand(command: string): void {
        const terminal = vscode.window.createTerminal('Navigator Command');
        terminal.show();
        // Add a small delay to ensure the terminal is ready
        setTimeout(() => {
            terminal.sendText(command);
        }, 500);
    }

    context.subscriptions.push(
        // DRAG AND DROP 
        vscode.commands.registerCommand('ocrmnavigator.moveItem', (item: NavigatorItem) => {
            itemToMove = item;
            vscode.window.showInformationMessage(`Selected "${item.label}" to move. Now select destination folder.`);
        }),
        vscode.commands.registerCommand('ocrmnavigator.setMoveTarget', async (parentItem: NavigatorItem) => {
            if (!itemToMove) {
                vscode.window.showErrorMessage('No item selected to move');
                return;
            }

            // Create a local reference that TypeScript knows can't become null
            const item = itemToMove;

            try {
                // Load config
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent) as NavigatorConfig;

                // Find and remove the item
                let itemRemoved = false;
                for (const category of config.categories) {
                    // Use optional chaining and nullish coalescing
                    const itemIndex = category.items?.findIndex(existingItem => {
                        // For files, compare full paths
                        if (item.type === 'file' || item.type === 'url' || item.type === 'folder') {
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

                        vscode.commands.executeCommand('ocrmnavigator.refresh');
                        vscode.window.showInformationMessage(`Removed "${item.label}" from navigator`);
                        break;
                    }
                }

                if (!itemRemoved) {
                    vscode.window.showWarningMessage('Could not find original item in config');
                }

                // Find parent category
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
                vscode.commands.executeCommand('ocrmnavigator.refresh');
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

                vscode.commands.executeCommand('ocrmnavigator.refresh');
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
                const folderSelection = await selectFolder(config);
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
            updateFolderExpansion(item, false);
            vscode.commands.executeCommand('ocrmnavigator.refresh');
        }),
        vscode.commands.registerCommand('ocrmnavigator.expandFolder', (item: NavigatorItem) => {
            updateFolderExpansion(item, true);
            vscode.commands.executeCommand('ocrmnavigator.refresh');
        }),


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
                const folderSelection = await selectFolder(config);
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
                    filePath: ''
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
                const category = await selectFolder(config);
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
                const category = await selectFolder(config);
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
                vscode.commands.executeCommand('ocrmnavigator.refresh');
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
    // Function to generate the HTML content for our webview
    function getCommandsWebviewContent() {
        const iadded = [
            ["foldLevel1", "editor.foldLevel1"],
            ["foldLevel2", "editor.foldLevel2"],
            ["foldLevel3", "editor.foldLevel3"],
            ["foldLevel4", "editor.foldLevel4"],
            ["foldLevel5", "editor.foldLevel5"],
            ["foldLevel6", "editor.foldLevel6"],
            ["foldLevel7", "editor.foldLevel7"],
            ["unfoldAll", "editor.unfoldAll"],

        ]
        // Define our commands array
        const commandArray = [
            ["ShortcutMenuBar.save", "workbench.action.files.save"],
            ["ShortcutMenuBar.toggleTerminal", "workbench.action.terminal.toggleTerminal"],
            ["ShortcutMenuBar.toggleActivityBar", "workbench.action.toggleActivityBarVisibility"],
            ["ShortcutMenuBar.navigateBack", "workbench.action.navigateBack"],
            ["ShortcutMenuBar.navigateForward", "workbench.action.navigateForward"],
            ["ShortcutMenuBar.toggleRenderWhitespace", "editor.action.toggleRenderWhitespace"],
            ["ShortcutMenuBar.quickOpen", "workbench.action.quickOpen"],
            ["ShortcutMenuBar.findReplace", "editor.action.startFindReplaceAction"],
            ["ShortcutMenuBar.undo", "undo"],
            ["ShortcutMenuBar.redo", "redo"],
            ["ShortcutMenuBar.commentLine", "editor.action.commentLine"],
            ["ShortcutMenuBar.saveAll", "workbench.action.files.saveAll"],
            ["ShortcutMenuBar.openFile", "workbench.action.files.openFile"],
            ["ShortcutMenuBar.newFile", "workbench.action.files.newUntitledFile"],
            ["ShortcutMenuBar.goToDefinition", "editor.action.revealDefinition"],
            ["ShortcutMenuBar.cut", "editor.action.clipboardCutAction"],
            ["ShortcutMenuBar.copy", "editor.action.clipboardCopyAction"],
            ["ShortcutMenuBar.paste", "editor.action.clipboardPasteAction"],
            ["ShortcutMenuBar.compareWithSaved", "workbench.files.action.compareWithSaved"],
            ["ShortcutMenuBar.showCommands", "workbench.action.showCommands"],
            ["ShortcutMenuBar.startDebugging", "workbench.action.debug.start"],
            ["ShortcutMenuBar.indentLines", "editor.action.indentLines"],
            ["ShortcutMenuBar.outdentLines", "editor.action.outdentLines"],
            ["ShortcutMenuBar.openSettings", "workbench.action.openSettings"],
            ["ShortcutMenuBar.toggleWordWrap", "editor.action.toggleWordWrap"],
            ["ShortcutMenuBar.changeEncoding", "workbench.action.editor.changeEncoding"],
            ["ShortcutMenuBar.powershellRestartSession", "PowerShell.RestartSession"]
        ];


        const fileCommands = [
            ["File.New", "workbench.action.files.newUntitledFile"],
            ["File.Open", "workbench.action.files.openFile"],
            ["File.OpenFolder", "workbench.action.files.openFolder"],
            ["File.Save", "workbench.action.files.save"],
            ["File.SaveAs", "workbench.action.files.saveAs"],
            ["File.SaveAll", "workbench.action.files.saveAll"],
            ["File.Close", "workbench.action.closeActiveEditor"],
            ["File.CloseAll", "workbench.action.closeAllEditors"],
            ["File.CloseFolder", "workbench.action.closeFolder"],
            ["File.Revert", "workbench.action.files.revert"],
            ["File.Compare", "workbench.files.action.compareWithSaved"],
            ["File.Rename", "workbench.files.action.showActiveFileInExplorer"],
            ["File.RevealInExplorer", "revealFileInOS"],
            ["File.ShowOpenedFileInNewWindow", "workbench.action.files.showOpenedFileInNewWindow"],
            ["File.CopyPath", "workbench.action.files.copyPathOfActiveFile"],
            ["File.OpenRecent", "workbench.action.openRecent"]
        ];

        const editCommands = [
            ["Edit.Undo", "undo"],
            ["Edit.Redo", "redo"],
            ["Edit.Cut", "editor.action.clipboardCutAction"],
            ["Edit.Copy", "editor.action.clipboardCopyAction"],
            ["Edit.Paste", "editor.action.clipboardPasteAction"],
            ["Edit.Find", "actions.find"],
            ["Edit.Replace", "editor.action.startFindReplaceAction"],
            ["Edit.FindInFiles", "workbench.action.findInFiles"],
            ["Edit.ReplaceInFiles", "workbench.action.replaceInFiles"],
            ["Edit.CommentLine", "editor.action.commentLine"],
            ["Edit.FormatDocument", "editor.action.formatDocument"],
            ["Edit.FormatSelection", "editor.action.formatSelection"],
            ["Edit.IndentLine", "editor.action.indentLines"],
            ["Edit.OutdentLine", "editor.action.outdentLines"],
            ["Edit.SelectAll", "editor.action.selectAll"],
            ["Edit.DeleteLine", "editor.action.deleteLines"],
            ["Edit.InsertLineAbove", "editor.action.insertLineBefore"],
            ["Edit.InsertLineBelow", "editor.action.insertLineAfter"],
            ["Edit.CursorUndo", "cursorUndo"],
            ["Edit.CursorRedo", "cursorRedo"],
            ["Edit.MoveLineUp", "editor.action.moveLinesUpAction"],
            ["Edit.MoveLineDown", "editor.action.moveLinesDownAction"],
            ["Edit.DuplicateSelection", "editor.action.duplicateSelection"],
            ["Edit.JoinLines", "editor.action.joinLines"],
            ["Edit.ToggleWordWrap", "editor.action.toggleWordWrap"],
            ["Edit.TransformToUppercase", "editor.action.transformToUppercase"],
            ["Edit.TransformToLowercase", "editor.action.transformToLowercase"],
            ["Edit.TransformToTitlecase", "editor.action.transformToTitlecase"]
        ];

        const viewCommands = [
            ["View.CommandPalette", "workbench.action.showCommands"],
            ["View.OpenView", "workbench.view.explorer"],
            ["View.Explorer", "workbench.view.explorer"],
            ["View.Search", "workbench.view.search"],
            ["View.SourceControl", "workbench.view.scm"],
            ["View.Run", "workbench.view.debug"],
            ["View.Extensions", "workbench.view.extensions"],
            ["View.Problems", "workbench.actions.view.problems"],
            ["View.Output", "workbench.action.output.toggleOutput"],
            ["View.Debug", "workbench.view.debug"],
            ["View.Terminal", "workbench.action.terminal.toggleTerminal"],
            ["View.ZoomIn", "workbench.action.zoomIn"],
            ["View.ZoomOut", "workbench.action.zoomOut"],
            ["View.ZoomReset", "workbench.action.zoomReset"],
            ["View.ToggleSidebarVisibility", "workbench.action.toggleSidebarVisibility"],
            ["View.ToggleActivityBarVisibility", "workbench.action.toggleActivityBarVisibility"],
            ["View.ToggleStatusBarVisibility", "workbench.action.toggleStatusbarVisibility"],
            ["View.ToggleTabs", "workbench.action.toggleTabsVisibility"],
            ["View.ToggleFullScreen", "workbench.action.toggleFullScreen"],
            ["View.ToggleZenMode", "workbench.action.toggleZenMode"],
            ["View.TogglePanelPosition", "workbench.action.togglePanelPosition"],
            ["View.SplitEditorRight", "workbench.action.splitEditorRight"],
            ["View.SplitEditorDown", "workbench.action.splitEditorDown"],
            ["View.FocusFirstEditorGroup", "workbench.action.focusFirstEditorGroup"],
            ["View.FocusSecondEditorGroup", "workbench.action.focusSecondEditorGroup"],
            ["View.FocusThirdEditorGroup", "workbench.action.focusThirdEditorGroup"],
            ["View.ToggleMinimap", "editor.action.toggleMinimap"],
            ["View.ToggleRenderWhitespace", "editor.action.toggleRenderWhitespace"],
            ["View.ToggleBreadcrumbs", "breadcrumbs.toggle"]
        ];

        const navigationCommands = [
            ["Navigation.GoToFile", "workbench.action.quickOpen"],
            ["Navigation.GoToSymbol", "workbench.action.gotoSymbol"],
            ["Navigation.GoToLine", "workbench.action.gotoLine"],
            ["Navigation.GoToDefinition", "editor.action.revealDefinition"],
            ["Navigation.GoToTypeDefinition", "editor.action.goToTypeDefinition"],
            ["Navigation.GoToImplementation", "editor.action.goToImplementation"],
            ["Navigation.GoToReferences", "editor.action.goToReferences"],
            ["Navigation.PeekDefinition", "editor.action.peekDefinition"],
            ["Navigation.PeekImplementation", "editor.action.peekImplementation"],
            ["Navigation.PeekReferences", "editor.action.referenceSearch.trigger"],
            ["Navigation.ShowAllSymbols", "workbench.action.showAllSymbols"],
            ["Navigation.NavigateBack", "workbench.action.navigateBack"],
            ["Navigation.NavigateForward", "workbench.action.navigateForward"],
            ["Navigation.NextEditor", "workbench.action.nextEditor"],
            ["Navigation.PreviousEditor", "workbench.action.previousEditor"],
            ["Navigation.NextInFile", "editor.action.marker.next"],
            ["Navigation.PreviousInFile", "editor.action.marker.prev"],
            ["Navigation.NextError", "editor.action.marker.nextInFiles"],
            ["Navigation.PreviousError", "editor.action.marker.prevInFiles"],
            ["Navigation.LastEditLocation", "workbench.action.navigateToLastEditLocation"],
            ["Navigation.SwitchEditor", "workbench.action.openEditorAtIndex1"] // 1-9 are supported
        ];

        const debugCommands = [
            ["Debug.Start", "workbench.action.debug.start"],
            ["Debug.Stop", "workbench.action.debug.stop"],
            ["Debug.Restart", "workbench.action.debug.restart"],
            ["Debug.Continue", "workbench.action.debug.continue"],
            ["Debug.Pause", "workbench.action.debug.pause"],
            ["Debug.StepOver", "workbench.action.debug.stepOver"],
            ["Debug.StepInto", "workbench.action.debug.stepInto"],
            ["Debug.StepOut", "workbench.action.debug.stepOut"],
            ["Debug.ToggleBreakpoint", "editor.debug.action.toggleBreakpoint"],
            ["Debug.EnableAllBreakpoints", "workbench.debug.viewlet.action.enableAllBreakpoints"],
            ["Debug.DisableAllBreakpoints", "workbench.debug.viewlet.action.disableAllBreakpoints"],
            ["Debug.RemoveAllBreakpoints", "workbench.debug.viewlet.action.removeAllBreakpoints"],
            ["Debug.AddConditionalBreakpoint", "editor.debug.action.conditionalBreakpoint"],
            ["Debug.RunToCursor", "editor.debug.action.runToCursor"],
            ["Debug.ShowHoverEvaluation", "editor.debug.action.showDebugHover"]
        ];

        const terminalCommands = [
            ["Terminal.New", "workbench.action.terminal.new"],
            ["Terminal.Split", "workbench.action.terminal.split"],
            ["Terminal.Kill", "workbench.action.terminal.kill"],
            ["Terminal.Clear", "workbench.action.terminal.clear"],
            ["Terminal.ToggleTerminal", "workbench.action.terminal.toggleTerminal"],
            ["Terminal.Rename", "workbench.action.terminal.rename"],
            ["Terminal.FocusNext", "workbench.action.terminal.focusNext"],
            ["Terminal.FocusPrevious", "workbench.action.terminal.focusPrevious"],
            ["Terminal.SelectAll", "workbench.action.terminal.selectAll"],
            ["Terminal.RunSelectedText", "workbench.action.terminal.runSelectedText"],
            ["Terminal.ScrollUp", "workbench.action.terminal.scrollUp"],
            ["Terminal.ScrollDown", "workbench.action.terminal.scrollDown"],
            ["Terminal.ScrollToTop", "workbench.action.terminal.scrollToTop"],
            ["Terminal.ScrollToBottom", "workbench.action.terminal.scrollToBottom"],
            ["Terminal.NavigationNext", "workbench.action.terminal.navigationNext"],
            ["Terminal.NavigationPrevious", "workbench.action.terminal.navigationPrevious"]
        ];

        const workspaceCommands = [
            ["Workspace.NewWindow", "workbench.action.newWindow"],
            ["Workspace.CloseWindow", "workbench.action.closeWindow"],
            ["Workspace.CloseFolder", "workbench.action.closeFolder"],
            ["Workspace.SaveWorkspaceAs", "workbench.action.saveWorkspaceAs"],
            ["Workspace.DuplicateWorkspaceInNewWindow", "workbench.action.duplicateWorkspaceInNewWindow"],
            ["Workspace.AddFolder", "workbench.action.addRootFolder"],
            ["Workspace.RemoveFolder", "workbench.action.removeRootFolder"],
            ["Workspace.OpenSettings", "workbench.action.openSettings"],
            ["Workspace.OpenKeyboardShortcuts", "workbench.action.openGlobalKeybindings"],
            ["Workspace.OpenSnippets", "workbench.action.openSnippets"],
            ["Workspace.OpenUserTasks", "workbench.action.tasks.openUserTasks"],
            ["Workspace.ConfigureLanguageSpecificSettings", "workbench.action.configureLanguageBasedSettings"],
            ["Workspace.RestartExtensionHost", "workbench.action.restartExtensionHost"]
        ];

        const extensionCommands = [
            ["Extensions.InstallExtension", "workbench.extensions.action.installExtension"],
            ["Extensions.ShowInstalledExtensions", "workbench.extensions.action.showInstalledExtensions"],
            ["Extensions.ShowRecommendedExtensions", "workbench.extensions.action.showRecommendedExtensions"],
            ["Extensions.ShowPopularExtensions", "workbench.extensions.action.showPopularExtensions"],
            ["Extensions.UpdateAllExtensions", "workbench.extensions.action.updateAllExtensions"],
            ["Extensions.EnableAllExtensions", "workbench.extensions.action.enableAllExtensions"],
            ["Extensions.DisableAllExtensions", "workbench.extensions.action.disableAllExtensions"],
            ["Extensions.ShowExtensionsForLanguage", "workbench.extensions.action.showLanguageExtensions"],
            ["Extensions.CheckForExtensionUpdates", "workbench.extensions.action.checkForUpdates"],
            ["Extensions.OpenExtensionsFolder", "workbench.extensions.action.openExtensionsFolder"]
        ];

        const editorGroupCommands = [
            ["EditorGroup.NewGroupAbove", "workbench.action.newGroupAbove"],
            ["EditorGroup.NewGroupBelow", "workbench.action.newGroupBelow"],
            ["EditorGroup.NewGroupLeft", "workbench.action.newGroupLeft"],
            ["EditorGroup.NewGroupRight", "workbench.action.newGroupRight"],
            ["EditorGroup.CloseGroup", "workbench.action.closeGroup"],
            ["EditorGroup.CloseOtherGroups", "workbench.action.closeOtherGroups"],
            ["EditorGroup.MoveEditorLeft", "workbench.action.moveEditorLeftInGroup"],
            ["EditorGroup.MoveEditorRight", "workbench.action.moveEditorRightInGroup"],
            ["EditorGroup.MoveEditorToLeftGroup", "workbench.action.moveEditorToLeftGroup"],
            ["EditorGroup.MoveEditorToRightGroup", "workbench.action.moveEditorToRightGroup"],
            ["EditorGroup.MoveEditorToAboveGroup", "workbench.action.moveEditorToAboveGroup"],
            ["EditorGroup.MoveEditorToBelowGroup", "workbench.action.moveEditorToBelowGroup"],
            ["EditorGroup.MoveEditorToFirstGroup", "workbench.action.moveEditorToFirstGroup"],
            ["EditorGroup.MoveEditorToLastGroup", "workbench.action.moveEditorToLastGroup"],
            ["EditorGroup.FocusPreviousGroup", "workbench.action.focusPreviousGroup"],
            ["EditorGroup.FocusNextGroup", "workbench.action.focusNextGroup"],
            ["EditorGroup.FocusAboveGroup", "workbench.action.focusAboveGroup"],
            ["EditorGroup.FocusBelowGroup", "workbench.action.focusBelowGroup"],
            ["EditorGroup.FocusLeftGroup", "workbench.action.focusLeftGroup"],
            ["EditorGroup.FocusRightGroup", "workbench.action.focusRightGroup"]
        ];

        const languageCommands = [
            ["Language.ChangeLanguageMode", "workbench.action.editor.changeLanguageMode"],
            ["Language.ConfigureLanguageBasedSettings", "workbench.action.configureLanguageBasedSettings"],
            ["Language.ShowReferences", "editor.action.showReferences"],
            ["Language.Rename", "editor.action.rename"],
            ["Language.TriggerParameterHints", "editor.action.triggerParameterHints"],
            ["Language.TriggerSuggest", "editor.action.triggerSuggest"],
            ["Language.ShowHover", "editor.action.showHover"],
            ["Language.QuickFix", "editor.action.quickFix"],
            ["Language.OrganizeImports", "editor.action.organizeImports"],
            ["Language.CodeAction", "editor.action.codeAction"],
            ["Language.SourceAction", "editor.action.sourceAction"],
            ["Language.FindAllReferences", "references-view.findReferences"],
            ["Language.InspectTMScopes", "editor.action.inspectTMScopes"],
            ["Language.ForceRetokenize", "editor.action.forceRetokenize"]
        ];

        const preferenceCommands = [
            ["Preferences.OpenSettings", "workbench.action.openSettings"],
            ["Preferences.OpenSettingsJson", "workbench.action.openSettingsJson"],
            ["Preferences.OpenUserSettings", "workbench.action.openGlobalSettings"],
            ["Preferences.OpenWorkspaceSettings", "workbench.action.openWorkspaceSettings"],
            ["Preferences.OpenFolderSettings", "workbench.action.openFolderSettings"],
            ["Preferences.OpenDefaultSettings", "workbench.action.openDefaultSettings"],
            ["Preferences.OpenKeyboardShortcuts", "workbench.action.openGlobalKeybindings"],
            ["Preferences.OpenKeyboardShortcutsJson", "workbench.action.openGlobalKeybindingsFile"],
            ["Preferences.OpenUserSnippets", "workbench.action.openSnippets"],
            ["Preferences.SelectColorTheme", "workbench.action.selectTheme"],
            ["Preferences.SelectIconTheme", "workbench.action.selectIconTheme"],
            ["Preferences.SelectProductIconTheme", "workbench.action.selectProductIconTheme"],
            ["Preferences.ConfigureDisplayLanguage", "workbench.action.configureLocale"]
        ];

        const searchCommands = [
            ["Search.Find", "actions.find"],
            ["Search.Replace", "editor.action.startFindReplaceAction"],
            ["Search.FindInFiles", "workbench.action.findInFiles"],
            ["Search.ReplaceInFiles", "workbench.action.replaceInFiles"],
            ["Search.FindNext", "editor.action.nextMatchFindAction"],
            ["Search.FindPrevious", "editor.action.previousMatchFindAction"],
            ["Search.SearchEditor.CreateEditorFromSearch", "search.action.openNewEditor"],
            ["Search.SearchEditor.RerunSearchWithContext", "search.action.rerunSearchWithContext"],
            ["Search.ToggleCaseSensitive", "toggleSearchCaseSensitive"],
            ["Search.ToggleWholeWord", "toggleSearchWholeWord"],
            ["Search.ToggleRegex", "toggleSearchRegex"],
            ["Search.ToggleSearchPreserveCase", "toggleSearchPreserveCase"],
            ["Search.CollapseSearchResults", "search.action.collapseSearchResults"],
            ["Search.ShowNextSearchTerm", "search.history.showNext"],
            ["Search.ShowPreviousSearchTerm", "search.history.showPrevious"]
        ];

        const gitCommands = [
            ["Git.Clone", "git.clone"],
            ["Git.Init", "git.init"],
            ["Git.Commit", "git.commit"],
            ["Git.CommitAll", "git.commitAll"],
            ["Git.CommitAllSigned", "git.commitAllSigned"],
            ["Git.CommitSigned", "git.commitSigned"],
            ["Git.CommitStaged", "git.commitStaged"],
            ["Git.CommitStagedSigned", "git.commitStagedSigned"],
            ["Git.CommitEmpty", "git.commitEmpty"],
            ["Git.Push", "git.push"],
            ["Git.PushWithTags", "git.pushWithTags"],
            ["Git.Pull", "git.pull"],
            ["Git.Fetch", "git.fetch"],
            ["Git.Sync", "git.sync"],
            ["Git.Publish", "git.publish"],
            ["Git.Checkout", "git.checkout"],
            ["Git.Branch", "git.branch"],
            ["Git.CreateTag", "git.createTag"],
            ["Git.DeleteTag", "git.deleteTag"],
            ["Git.Merge", "git.merge"],
            ["Git.Rebase", "git.rebase"],
            ["Git.Stage", "git.stage"],
            ["Git.StageAll", "git.stageAll"],
            ["Git.StageChange", "git.stageChange"],
            ["Git.Unstage", "git.unstage"],
            ["Git.UnstageAll", "git.unstageAll"],
            ["Git.Clean", "git.clean"],
            ["Git.CleanAll", "git.cleanAll"],
            ["Git.Stash", "git.stash"],
            ["Git.StashPop", "git.stashPop"],
            ["Git.StashApply", "git.stashApply"],
            ["Git.StashDrop", "git.stashDrop"],
            ["Git.ShowOutput", "git.showOutput"],
            ["Git.Refresh", "git.refresh"],
            ["Git.OpenFile", "git.openFile"],
            ["Git.OpenAllChanges", "git.openAllChanges"],
            ["Git.OpenChange", "git.openChange"],
            ["Git.OpenRepositoryInGitHub", "git.openRepositoryInGithub"]
        ];

        const taskCommands = [
            ["Tasks.RunBuildTask", "workbench.action.tasks.build"],
            ["Tasks.RunTestTask", "workbench.action.tasks.test"],
            ["Tasks.RunTask", "workbench.action.tasks.runTask"],
            ["Tasks.RestartTask", "workbench.action.tasks.restartTask"],
            ["Tasks.ShowTasks", "workbench.action.tasks.showTasks"],
            ["Tasks.TerminateTask", "workbench.action.tasks.terminate"],
            ["Tasks.ConfigureTaskRunner", "workbench.action.tasks.configureTaskRunner"],
            ["Tasks.ConfigureDefaultBuildTask", "workbench.action.tasks.configureDefaultBuildTask"],
            ["Tasks.ConfigureDefaultTestTask", "workbench.action.tasks.configureDefaultTestTask"]
        ];

        // Combine all categories
        const allCommands = [
            ...iadded,
            ...commandArray,
            ...fileCommands,
            ...editCommands,
            ...viewCommands,
            ...navigationCommands,
            ...debugCommands,
            ...terminalCommands,
            ...workspaceCommands,
            ...extensionCommands,
            ...editorGroupCommands,
            ...languageCommands,
            ...preferenceCommands,
            ...searchCommands,
            ...gitCommands,
            ...taskCommands
        ];

        // Define category mapping for the dropdown
        const categories = [
            { id: 'other', name: 'Other Commands', commands: commandArray },
            { id: 'custom', name: 'Generic Commands', commands: commandArray },
            { id: 'all', name: 'All Commands', commands: allCommands },
            { id: 'file', name: 'File Commands', commands: fileCommands },
            { id: 'edit', name: 'Edit Commands', commands: editCommands },
            { id: 'view', name: 'View Commands', commands: viewCommands },
            { id: 'navigation', name: 'Navigation Commands', commands: navigationCommands },
            { id: 'debug', name: 'Debug Commands', commands: debugCommands },
            { id: 'terminal', name: 'Terminal Commands', commands: terminalCommands },
            { id: 'workspace', name: 'Workspace Commands', commands: workspaceCommands },
            { id: 'extension', name: 'Extension Commands', commands: extensionCommands },
            { id: 'editorGroup', name: 'Editor Group Commands', commands: editorGroupCommands },
            { id: 'language', name: 'Language Commands', commands: languageCommands },
            { id: 'preference', name: 'Preference Commands', commands: preferenceCommands },
            { id: 'search', name: 'Search Commands', commands: searchCommands },
            { id: 'git', name: 'Git Commands', commands: gitCommands },
            { id: 'task', name: 'Task Commands', commands: taskCommands }
        ];

        // Generate the dropdown options
        const categoryOptions = categories.map(category => {
            return `<option value="${category.id}">${category.name}</option>`;
        }).join('');

        type CommandTuple = [string, string];

        function generateCommandRows(commands: any) {
            return commands.map(([name, commandId]: [string, string]) => {
                // Format the display name by removing prefix and adding spaces
                const displayName = name.replace(/^[^.]*\./, '')
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim();

                return `
    <tr data-category="${getCategoryIdForCommand(name)}">
      <td>${displayName}</td>
      <td><code>${commandId}</code></td>
      <td>
        <button class="copy-btn" data-command="${commandId}">Copy</button>
      </td>
    </tr>
  `;
            }).join('');
        }

        // Helper function to determine category id for a command based on its name
        function getCategoryIdForCommand(name: any) {
            if (name.startsWith('ShortcutMenuBar.')) return 'custom';
            if (name.startsWith('Navigation.')) return 'navigation';
            if (name.startsWith('File.')) return 'file';
            if (name.startsWith('Edit.')) return 'edit';
            if (name.startsWith('View.')) return 'view';
            if (name.startsWith('Go.') || name.startsWith('Navigate.')) return 'navigation';
            if (name.startsWith('Debug.')) return 'debug';
            if (name.startsWith('Terminal.')) return 'terminal';
            if (name.startsWith('Workspace.')) return 'workspace';
            if (name.startsWith('Extensions.')) return 'extension';
            if (name.startsWith('EditorGroup.')) return 'editorGroup';
            if (name.startsWith('Language.')) return 'language';
            if (name.startsWith('Preferences.')) return 'preference';
            if (name.startsWith('Search.')) return 'search';
            if (name.startsWith('Git.')) return 'git';
            if (name.startsWith('Tasks.')) return 'task';
            return 'other';
        }

        // Generate all command rows
        const commandRows = generateCommandRows(allCommands);

        // Return the full HTML content
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VSCode Commands Reference</title>
              <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            padding: 20px;
            line-height: 1.5;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
          }
          h1, h2 {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            text-align: left;
            padding: 10px;
            background-color: var(--vscode-editor-selectionBackground);
            border-bottom: 2px solid var(--vscode-panel-border);
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }
          tr:hover {
            background-color: var(--vscode-list-hoverBackground);
          }
          code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          }
          pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 5px;
            overflow: auto;
          }
          .copy-btn {
            padding: 3px 8px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
          }
          .copy-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
          .search-container {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
          }
          .search-input {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
          }
          .category-dropdown {
            padding: 8px;
            border: 1px solid var(--vscode-dropdown-border);
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            border-radius: 4px;
          }
          .success-message {
            color: #4caf50;
            margin-left: 10px;
            opacity: 0;
            transition: opacity 0.3s;
          }
          .usage-examples {
            margin-top: 30px;
          }
          .category-header {
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .no-results {
            text-align: center;
            padding: 20px;
            font-style: italic;
            display: none;
          }
        </style>
      </head>
      <body>
        <h1>VSCode Commands Reference</h1>
        <p>Below is a list of useful VSCode commands that you can use in your extension:</p>
        
          <div class="search-container">
          <input type="text" id="searchInput" class="search-input" placeholder="Search for commands...">
          <select id="categoryFilter" class="category-dropdown">
            ${categoryOptions}
          </select>
        </div>
        <h4>File Commands</h4>
        <table id="commandsTable">
          <thead>
            <tr>
              <th>Command Name</th>
              <th>Command ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${commandRows}
          </tbody>
        </table>
        
        <div class="usage-examples">
          <h2>How to Use</h2>
          <p>To use these commands in your extension, you can register them in the extension:</p>
          <p>1) Copy the command, then click on the menu button in the pane and select Add Command.</p>
          <p>2) Input the cmd, the label and where you would like it stored on your quick access panel.</p>
          <p>3) Enjoy.</p>
        </div>
        
       
        <script>
          (function() {
            // Handle copy button clicks
            const copyButtons = document.querySelectorAll('.copy-btn');
            copyButtons.forEach(button => {
              button.addEventListener('click', () => {
                const commandId = button.getAttribute('data-command');
                navigator.clipboard.writeText(commandId).then(() => {
                  // Show success message
                  const originalText = button.textContent;
                  button.textContent = 'Copied!';
                  setTimeout(() => {
                    button.textContent = originalText;
                  }, 1500);
                });
              });
            });
            
            // Get references to DOM elements
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const table = document.getElementById('commandsTable');
            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            const noResults = document.getElementById('noResults');
            
            // Function to filter the commands
            function filterCommands() {
              const query = searchInput.value.toLowerCase();
              const selectedCategory = categoryFilter.value;
              
              let visibleRows = 0;
              
              for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const nameCol = row.getElementsByTagName('td')[0];
                const cmdCol = row.getElementsByTagName('td')[1];
                const rowCategory = row.getAttribute('data-category');
                
                if (nameCol && cmdCol) {
                  const nameText = nameCol.textContent || nameCol.innerText;
                  const cmdText = cmdCol.textContent || cmdCol.innerText;
                  
                  const matchesSearch = query === '' || 
                    nameText.toLowerCase().includes(query) || 
                    cmdText.toLowerCase().includes(query);
                    
                  const matchesCategory = selectedCategory === 'all' || rowCategory === selectedCategory;
                  
                  if (matchesSearch && matchesCategory) {
                    row.style.display = '';
                    visibleRows++;
                  } else {
                    row.style.display = 'none';
                  }
                }
              }
              
              // Show or hide the "no results" message
              if (visibleRows === 0) {
                noResults.style.display = 'block';
                table.style.display = 'none';
              } else {
                noResults.style.display = 'none';
                table.style.display = 'table';
              }
            }
            
            // Add event listeners
            searchInput.addEventListener('input', filterCommands);
            categoryFilter.addEventListener('change', filterCommands);
            
            // Initial filter application
            filterCommands();
          })();
        </script>
      </body>
      </html>
    `;
    }
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

    // Helper function to recursively search through nested folders
    function searchNestedFolder(folder: NavigatorCategoryItem, item: NavigatorItem): {
        parentCategory: NavigatorCategoryItem,
        itemIndex: number,
        itemsArray: any[]
    } | null {
        if (!folder.items) {
            return null;
        }

        // Search for the item in this folder's items
        const itemIndex = folder.items.findIndex(fileItem =>
            fileItem.label === item.label &&
            (fileItem.path === item.filePath || fileItem.filePath === item.filePath)
        );

        if (itemIndex !== -1) {
            return {
                parentCategory: folder,
                itemIndex: itemIndex,
                itemsArray: folder.items
            };
        }

        // Search through any nested folders
        for (const subItem of folder.items) {
            if (subItem.type === 'folder' && 'items' in subItem) {
                const nestedFolder = subItem as NavigatorCategoryItem;
                const result = searchNestedFolder(nestedFolder, item);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }
    // In your extension activation
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





    view.title = "F/F Navigator";
    setTimeout(() => {
        if (!view.visible) {
            vscode.commands.executeCommand('ocrmnavigatorNavigator.focus');
        }
    }, 1000);
}