

export async function showContextMenuForItem(item: any,vscode: any ) {
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
                    } if (item.type && item.type === 'command') { {
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
}}