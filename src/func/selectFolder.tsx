import { NavigatorProvider, NavigatorItem, NavigatorConfig, NavigatorCategoryItem, NavigatorQuickPickItem } from './interface';

// Function to select or create folder
export  const selectFolder = async (config: NavigatorConfig, vscode:any): Promise<{ targetItems: NavigatorItem[], location: string } | undefined> => {
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
