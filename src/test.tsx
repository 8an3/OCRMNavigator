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
            /* Base styles */
            :root {
                --background: #ffffff;
                --foreground: #1a1a1a;
                --card: #ffffff;
                --card-foreground: #1a1a1a;
                --popover: #ffffff;
                --popover-foreground: #1a1a1a;
                --primary: #4f46e5;
                --primary-foreground: #ffffff;
                --secondary: #f3f4f6;
                --secondary-foreground: #1f2937;
                --muted: #f3f4f6;
                --muted-foreground: #6b7280;
                --accent: #f3f4f6;
                --accent-foreground: #1f2937;
                --destructive: #ef4444;
                --destructive-foreground: #ffffff;
                --border: #e5e7eb;
                --input: #e5e7eb;
                --ring: #4f46e5;
                --radius: 0.5rem;
                --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            }

            .dark {
                --background: #1a1a1a;
                --foreground: #ffffff;
                --card: #252525;
                --card-foreground: #ffffff;
                --popover: #252525;
                --popover-foreground: #ffffff;
                --primary: #6366f1;
                --primary-foreground: #ffffff;
                --secondary: #2d2d2d;
                --secondary-foreground: #ffffff;
                --muted: #2d2d2d;
                --muted-foreground: #a1a1a1;
                --accent: #2d2d2d;
                --accent-foreground: #ffffff;
                --destructive: #ef4444;
                --destructive-foreground: #ffffff;
                --border: #333333;
                --input: #333333;
                --ring: #6366f1;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                background-color: var(--background);
                color: var(--foreground);
                font-family: var(--font-sans);
                padding: 2rem;
                line-height: 1.5;
                font-size: 14px;
                transition: background-color 0.3s ease;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
            }

            /* Header */
            .header {
                margin-bottom: 2rem;
            }

            .title {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .description {
                color: var(--muted-foreground);
                font-weight: 400;
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
            }

            /* Command Input */
            .command-wrapper {
                position: relative;
                margin-bottom: 1.5rem;
            }

            .command-input {
                width: 100%;
                padding: 0.75rem 1rem;
                padding-right: 2.5rem;
                border-radius: var(--radius);
                border: 1px solid var(--border);
                background-color: var(--background);
                color: var(--foreground);
                font-size: 0.875rem;
                line-height: 1.5;
                transition: border-color 0.2s, box-shadow 0.2s;
            }

            .command-input:focus {
                outline: none;
                box-shadow: 0 0 0 2px var(--ring);
                border-color: var(--ring);
            }

            .search-clear {
                position: absolute;
                top: 50%;
                right: 3rem;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--muted-foreground);
                cursor: pointer;
                width: 1.5rem;
                height: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }

            .search-clear:hover {
                background-color: var(--secondary);
                color: var(--secondary-foreground);
            }

            .dropdown-toggle {
                position: absolute;
                top: 50%;
                right: 1rem;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--muted-foreground);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Commands dropdown */
            .command-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: var(--popover);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                margin-top: 0.25rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                z-index: 10;
                display: none;
                overflow: hidden;
                max-height: 250px;
                overflow-y: auto;
            }

            .command-dropdown.open {
                display: block;
            }

            .command-option {
                padding: 0.5rem 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .command-option:hover {
                background-color: var(--secondary);
            }

            .command-option.active {
                background-color: var(--secondary);
            }

            .command-option-title {
                font-weight: 500;
            }

            .command-option-description {
                font-size: 0.75rem;
                color: var(--muted-foreground);
                margin-top: 0.25rem;
            }

            /* Context Menu */
            .context-menu {
                position: absolute;
                background-color: var(--popover);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                z-index: 100;
                min-width: 160px;
                display: none;
            }

            .context-menu.open {
                display: block;
            }

            .context-menu-item {
                padding: 0.5rem 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
            }

            .context-menu-item:hover {
                background-color: var(--secondary);
            }

            .context-menu-item svg {
                margin-right: 0.5rem;
                width: 1rem;
                height: 1rem;
            }

            /* Snippet Content */
            .snippet-card {
                background-color: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                overflow: hidden;
                margin-bottom: 1rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .snippet-header {
                padding: 1rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .snippet-title {
                font-weight: 600;
                font-size: 1rem;
            }

            .snippet-description {
                color: var(--muted-foreground);
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }

            .snippet-container {
                position: relative;
            }

            .snippet-content {
                font-family: var(--font-mono);
                white-space: pre;
                overflow-x: auto;
                padding: 1rem;
                font-size: 0.875rem;
                background-color: var(--muted);
                color: var(--muted-foreground);
                min-height: 100px;
                border-radius: 0 0 var(--radius) var(--radius);
            }

            .snippet-content:focus {
                outline: none;
            }

            .code-highlight {
                background-color: #f3f4f6;
            }

            .dark .code-highlight {
                background-color: #2d2d2d;
            }

            /* Buttons */
            .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0.5rem 1rem;
                border-radius: var(--radius);
                font-size: 0.875rem;
                font-weight: 500;
                line-height: 1;
                cursor: pointer;
                transition: background-color 0.2s, color 0.2s, border-color 0.2s;
            }

            .button-primary {
                background-color: var(--primary);
                color: var(--primary-foreground);
                border: none;
            }

            .button-primary:hover {
                background-color: hsl(245, 86%, 55%);
            }

            .button-secondary {
                background-color: var(--secondary);
                color: var(--secondary-foreground);
                border: 1px solid var(--border);
            }

            .button-secondary:hover {
                background-color: var(--accent);
                color: var(--accent-foreground);
            }

            .button-ghost {
                background-color: transparent;
                border: none;
                color: var(--muted-foreground);
                padding: 0.25rem;
            }

            .button-ghost:hover {
                background-color: var(--secondary);
                color: var(--secondary-foreground);
            }

            .button-sm {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
            }

            .button-icon {
                width: 1rem;
                height: 1rem;
                margin-right: 0.25rem;
            }

            .button-icon-only {
                padding: 0.5rem;
            }

            .button-icon-only .button-icon {
                margin-right: 0;
            }

            .copy-button {
                position: absolute;
                bottom: 0.75rem;
                right: 0.75rem;
                border-radius: var(--radius);
                background-color: var(--secondary);
                color: var(--secondary-foreground);
                border: 1px solid var(--border);
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .copy-button:hover {
                background-color: var(--accent);
            }

            /* Actions Bar */
            .actions-bar {
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            /* Theme Toggle */
            .theme-toggle {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                color: var(--muted-foreground);
                cursor: pointer;
                width: 2rem;
                height: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }

            .theme-toggle:hover {
                background-color: var(--secondary);
            }

            /* Loading State */
            .loading {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                color: var(--muted-foreground);
            }
            
            .spinner {
                border: 3px solid var(--muted);
                border-radius: 50%;
                border-top: 3px solid var(--primary);
                width: 1.5rem;
                height: 1.5rem;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* No Results */
            .no-results {
                text-align: center;
                padding: 2rem;
                color: var(--muted-foreground);
            }

            /* Helpers */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border-width: 0;
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
        < div class="snippet-card" >
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
                        </div >
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
                    contextMenu.style.top = `${ rect.bottom + window.scrollY } px`;
                    contextMenu.style.left = `${ rect.left + window.scrollX } px`;
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


const test = () =>
    return {}