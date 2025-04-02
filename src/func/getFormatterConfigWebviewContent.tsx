export function getFormatterConfigWebviewContent(webview, config) {
   
    const fileTypes = Object.keys(config.formatters);

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OCRM Navigator Formatter Configuration</title>
              <style>
            :root {
                --background: var(--vscode-editor-background, #09090b);
                --foreground: var(--vscode-editor-foreground, #fafafa);
                --primary: var(--vscode-button-background, #e4e4e7);
                --primary-foreground: var(--vscode-button-foreground, #18181b);
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
            <h1 class="header-1">OCRM Navigator - Formatter Configuration</h1>
            <p class="header-2">Configure custom formatting options for different file types.</p>
            
            <div class="tabs" id="fileTabs">
                ${fileTypes.map((type, index) => 
                    `<div class="tab ${index === 0 ? 'active' : ''}" data-tab="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</div>`
                ).join('')}
            </div>
        </div>
        
        <!-- Live Preview Section -->
        <div class="preview-container">
            <h2 class="header-3">Live Preview</h2>
            <div class="preview-panel">
                <div class="preview-header">
                    <div class="preview-title">Sample Code</div>
                    <div class="preview-buttons">
                        <button id="reset-preview">Reset Sample</button>
                    </div>
                </div>
                <div class="preview-content">
                    <div class="preview-editor" id="preview-editor"></div>
                </div>
            </div>
        </div>
        
        ${fileTypes.map((fileType, index) => `
            <div id="${fileType}-options" class="file-type-options ${index === 0 ? 'active' : ''}">
                <h2 class="header-3">${fileType.charAt(0).toUpperCase() + fileType.slice(1)} Formatter Options</h2>
                
                <div class="option-row">
                    <div class="option-label">
                        <label>Enable Formatter</label>
                        <div class="description text-p">Activate formatter for ${fileType} files</div>
                    </div>
                    <div class="option-input">
                        <input type="checkbox" id="${fileType}-enabled" ${config.formatters[fileType].enabled ? 'checked' : ''}>
                    </div>
                </div>
                
                ${Object.entries(config.formatters[fileType])
                    .filter(([key]) => key !== 'enabled')
                    .map(([key, value]) => {
                        const formatOption = formatDefaults[fileType] ? 
                            formatDefaults[fileType].find(opt => opt.id === key) : null;
                        
                        const labelText = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const inputType = typeof value === 'boolean' ? 'checkbox' : 
                                         (formatOption && formatOption.type === 'select') ? 'select' : 'number';
                        
                        return `
                            <div class="option-row">
                                <div class="option-label">
                                    <label>${labelText}</label>
                                    <div class="description text-p">${formatOption ? formatOption.description : `Configure ${labelText.toLowerCase()} for ${fileType} files`}</div>
                                </div>
                                <div class="option-input">
                                    ${inputType === 'checkbox' 
                                        ? `<input type="checkbox" id="${fileType}-${key}" ${value ? 'checked' : ''}>`
                                        : inputType === 'select'
                                            ? `<select id="${fileType}-${key}">
                                                ${formatOption.options.map(opt => 
                                                    `<option value="${opt.value}" ${value == opt.value ? 'selected' : ''}>${opt.label}</option>`
                                                ).join('')}
                                              </select>`
                                            : `<input type="number" id="${fileType}-${key}" value="${value}" 
                                                min="${formatOption?.min || 0}" max="${formatOption?.max || 100}">`
                                    }
                                </div>
                            </div>
                        `;
                    }).join('')
                }
            </div>
        `).join('')}
        
        <div style="margin-top: 30px;">
            <button id="saveButton">Save Configuration</button>
        </div>
    </div>
    
    <script>
        (function() {
            // Initialize with current config
            const currentConfig = ${JSON.stringify(config)};
            const formatDefaults = ${JSON.stringify(formatDefaults)};
            
            // Sample code snippets for different file types
            const sampleCode = {
                'tsx': \`
import React, { useState, useEffect } from 'react';
import { Button, TextField, Card } from './components';

interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
}

const UserProfile: React.FC<{ initialUser?: User }> = ({ initialUser }) => {
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!initialUser) {
            fetchUser();
        }
    }, [initialUser]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/user/1');
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (field: keyof User, value: any) => {
        if (user) {
            setUser({ ...user, [field]: value });
        }
    };

    return (
        <Card>
            {loading ? (
                <div>Loading user data...</div>
            ) : user ? (
                <div className="user-profile">
                    <h2>{user.name}</h2>
                    <TextField
                        label="Name"
                        value={user.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                    />
                    <TextField
                        label="Email"
                        value={user.email}
                        onChange={(e) => handleUpdate('email', e.target.value)}
                    />
                    <div className="status-toggle">
                        <span>Status: </span>
                        <Button onClick={() => handleUpdate('isActive', !user.isActive)}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div>No user data available</div>
            )}
        </Card>
    );
};

export default UserProfile;\`,
                'json': \`{
  "name": "ocrm-navigator",
  "version": "1.0.0",
  "description": "A VS Code extension for formatting and navigating code",
  "main": "dist/extension.js",
  "scripts": {
    "build": "webpack --mode production",
    "watch": "webpack --mode development --watch",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "keywords": [
    "vscode",
    "extension",
    "formatter",
    "navigation"
  ],
  "author": "OCRM Team",
  "license": "MIT",
  "dependencies": {
    "prettier": "^2.8.0",
    "typescript": "^4.9.0",
    "vscode-languageserver": "^8.0.2"
  },
  "devDependencies": {
    "@types/node": "^16.11.0",
    "@types/vscode": "^1.74.0",
    "@typescript-eslint/eslint-plugin": "^5.42.0",
    "@typescript-eslint/parser": "^5.42.0",
    "eslint": "^8.26.0",
    "webpack": "^5.74.0",
    "webpack-cli": "^4.10.0"
  }
}\`,
                'html': \`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OCRM Navigator</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="main-header">
        <div class="logo">
            <img src="logo.svg" alt="OCRM Navigator Logo">
            <h1>OCRM Navigator</h1>
        </div>
        <nav>
            <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#documentation">Documentation</a></li>
                <li><a href="#download">Download</a></li>
                <li><a href="#support">Support</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="hero">
            <div class="container">
                <h2>Code With Confidence</h2>
                <p>The ultimate VS Code extension for formatting and navigating your codebase</p>
                <button class="cta-button">Get Started</button>
            </div>
        </section>
        
        <section id="features">
            <div class="container">
                <h2>Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>Smart Formatting</h3>
                        <p>Customize formatting rules for each file type</p>
                    </div>
                    <div class="feature-card">
                        <h3>Code Navigation</h3>
                        <p>Jump between files and symbols effortlessly</p>
                    </div>
                    <div class="feature-card">
                        <h3>Real-time Preview</h3>
                        <p>See formatting changes as you configure them</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 OCRM Navigator Team</p>
        </div>
    </footer>
    
    <script src="main.js"></script>
</body>
</html>\`,
                'css': \`/* Main Styles for OCRM Navigator */

:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --text-color: #333;
    --background-color: #f9f9f9;
    --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header Styles */
.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo {
    display: flex;
    align-items: center;
}

.logo img {
    width: 40px;
    margin-right: 10px;
}

nav ul {
    display: flex;
    list-style: none;
}

nav ul li {
    margin-left: 20px;
}

nav ul li a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.3s;
}

nav ul li a:hover {
    color: var(--primary-color);
}

/* Form Elements */
.form-group {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Button Styles */
.btn {
    display: inline-block;
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #2980b9;
}

.btn-secondary {
    background-color: var(--secondary-color);
}

.btn-secondary:hover {
    background-color: #27ae60;
}\`,
                // Add more file types as needed
            };
            
            // Initialize Monaco Editor for preview
            let editor = null;
            let currentFileType = fileTypes[0];
            
            // Load Monaco Editor
            require(['vs/editor/editor.main'], function() {
                editor = monaco.editor.create(document.getElementById('preview-editor'), {
                    value: sampleCode[currentFileType] || 'No preview available for this file type.',
                    language: currentFileType,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    readOnly: false,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto'
                    }
                });
                
                // Initialize formatter
                updatePreview();
            });
            
            // Function to format code based on current settings
            function formatCode(code, options) {
                // Here you would integrate with your actual formatter (Prettier, etc.)
                // For now, we'll simulate formatting by applying a few obvious changes
                
                try {
                    // This is just placeholder logic - you'll need to integrate with your real formatter
                    if (currentFileType === 'tsx' || currentFileType === 'json' || currentFileType === 'html' || currentFileType === 'css') {
                        const formatted = prettier.format(code, {
                            parser: getParserForFileType(currentFileType),
                            printWidth: options.printWidth || 80,
                            tabWidth: options.tabWidth || 2,
                            useTabs: options.useTabs || false,
                            semi: options.semi !== undefined ? options.semi : true,
                            singleQuote: options.singleQuote || false,
                            bracketSpacing: options.bracketSpacing !== undefined ? options.bracketSpacing : true,
                            jsxBracketSameLine: options.jsxBracketSameLine || false,
                            arrowParens: options.arrowParens || 'always',
                            endOfLine: options.endOfLine || 'lf'
                        });
                        return formatted;
                    }
                    
                    return code; // Return original code if no formatter is available
                } catch (error) {
                    console.error('Error formatting code:', error);
                    return code; // Return original code on error
                }
            }
            
            function getParserForFileType(fileType) {
                switch (fileType) {
                    case 'tsx': return 'typescript';
                    case 'json': return 'json';
                    case 'html': return 'html';
                    case 'css': return 'css';
                    default: return 'babel';
                }
            }
            
            // Update preview when options change
            function updatePreview() {
                if (!editor) return;
                
                const code = editor.getValue();
                const options = {};
                
                // Gather current formatter options
                Object.entries(currentConfig.formatters[currentFileType])
                    .filter(([key]) => key !== 'enabled')
                    .forEach(([key, defaultValue]) => {
                        const element = document.getElementById(\`${currentFileType}-${key}\`);
                        if (element) {
                            if (element.type === 'checkbox') {
                                options[key] = element.checked;
                            } else if (element.tagName === 'SELECT') {
                                options[key] = element.value;
                            } else {
                                options[key] = parseFloat(element.value);
                            }
                        } else {
                            options[key] = defaultValue;
                        }
                    });
                
                // Format code with current options
                if (currentConfig.formatters[currentFileType].enabled) {
                    const formattedCode = formatCode(code, options);
                    if (formattedCode !== code) {
                        const position = editor.getPosition();
                        editor.setValue(formattedCode);
                        if (position) {
                            editor.setPosition(position);
                        }
                    }
                }
            }
            
            // Event listeners for options changes
            document.querySelectorAll('input, select').forEach(input => {
                input.addEventListener('change', updatePreview);
                if (input.type === 'number' || input.type === 'text') {
                    input.addEventListener('input', updatePreview);
                }
            });
            
            // Reset preview button
            document.getElementById('reset-preview').addEventListener('click', function() {
                if (editor && sampleCode[currentFileType]) {
                    editor.setValue(sampleCode[currentFileType]);
                    updatePreview();
                }
            });
            
            // Handle tab clicks
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remove active class from all tabs and content
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.file-type-options').forEach(el => {
                        el.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Show corresponding content
                    const tabType = this.dataset.tab;
                    currentFileType = tabType;
                    document.getElementById(tabType + '-options').classList.add('active');
                    
                    // Update editor language and content
                    if (editor) {
                        monaco.editor.setModelLanguage(editor.getModel(), tabType);
                        editor.setValue(sampleCode[tabType] || 'No preview available for this file type.');
                        updatePreview();
                    }
                });
            });
            
            // Handle save button click
            document.getElementById('saveButton').addEventListener('click', function() {
                const updatedConfig = { formatters: {} };
                
                // Gather all values from inputs
                ${fileTypes.map(fileType => `
                    updatedConfig.formatters['${fileType}'] = { 
                        enabled: document.getElementById('${fileType}-enabled').checked
                    };
                    
                    ${Object.entries(config.formatters[fileType])
                        .filter(([key]) => key !== 'enabled')
                        .map(([key, value]) => {
                            const formatOption = formatDefaults[fileType] ? 
                                formatDefaults[fileType].find(opt => opt.id === key) : null;
                            
                            const inputType = typeof value === 'boolean' ? 'checkbox' : 
                                            (formatOption && formatOption.type === 'select') ? 'select' : 'number';
                            
                            return inputType === 'checkbox'
                                ? `updatedConfig.formatters['${fileType}']['${key}'] = document.getElementById('${fileType}-${key}').checked;`
                                : inputType === 'select'
                                    ? `updatedConfig.formatters['${fileType}']['${key}'] = document.getElementById('${fileType}-${key}').value;`
                                    : `updatedConfig.formatters['${fileType}']['${key}'] = parseInt(document.getElementById('${fileType}-${key}').value, 10);`;
                        }).join('')
                    }
                `).join('')}
                
                // Send message to extension
                vscode.postMessage({
                    command: 'saveConfig',
                    config: updatedConfig
                });
            });
        })();
        
        // Initialize VSCode API
        const vscode = acquireVsCodeApi();
    </script>
</body>
        </html>
    `;
}