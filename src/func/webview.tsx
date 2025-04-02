

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