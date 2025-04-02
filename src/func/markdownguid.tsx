export function getMarkdownGuideContent(): string {
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