


export function executeTerminalCommand(command: string, vscode: any): void {
    const terminal = vscode.window.createTerminal('Navigator Command');
    terminal.show();
    // Add a small delay to ensure the terminal is ready
    setTimeout(() => {
        terminal.sendText(command);
    }, 500);
}