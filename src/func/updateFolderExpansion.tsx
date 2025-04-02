import { NavigatorProvider, NavigatorItem, NavigatorConfig, NavigatorCategoryItem, NavigatorQuickPickItem } from './interface';

// Helper function for folder expansion
export async function updateFolderExpansion(item: NavigatorItem, expanded: boolean, vscode:any) {
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