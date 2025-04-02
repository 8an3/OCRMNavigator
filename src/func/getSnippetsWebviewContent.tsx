export function getSnippetsWebviewContent(webview: vscode.Webview, snippets: Record<string, any>) {
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
export function registerSnippetsWebview(context: vscode.ExtensionContext) {
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