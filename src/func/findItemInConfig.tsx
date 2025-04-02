/interface';


// Helper function to recursively search through nested folders
export function searchNestedFolder(folder: NavigatorCategoryItem, item: NavigatorItem): {
    parentCategory: NavigatorCategoryItem,
    itemIndex: number,
    itemsArray: any[]
} | null {
    if (!folder.items) {
        return null;
    }

    // Search for the item in this folder's items
    const itemIndex = folder.items.findIndex((fileItem: any) =>
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

// Helper function to find an item in the configuration
export function findItemInConfig(config: NavigatorConfig, item: NavigatorItem): {
    parentCategory: NavigatorCategoryItem | null,
    itemIndex: number,
    itemsArray: any[]
} | null {
    // Search through all categories and their nested items
    for (const category of config.categories) {
        // Check if the item is directly in this category
        const categoryItemIndex = category.items.findIndex((fileItem: any) =>
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
                const subIndex = folderItem.items.findIndex((fileItem: any) =>
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