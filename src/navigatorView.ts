import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { advancedFuzzyFilter } from './func/advancedFuzzyFilter';
import {NavigatorConfig,
  NavigatorItem,
  NavigatorQuickPickItem,
  NavigatorCategoryItem, } from './func/interface'

  import * as vscode from 'vscode';

export interface NavigatorConfig { categories: NavigatorCategoryItem[];   data?: NavigatorItem; }


export interface NavigatorItem1 {
  label: string;
  path?: string;
  cmd?: string;
  type?: 'file' | 'url' | 'command' | 'category' | 'folder' | 'md' | 'snippet' | 'powershellCommand';
  collapsibleState: vscode.TreeItemCollapsibleState;
  filePath: string;
  children?: NavigatorItem[];
  body?: string;

  data?: NavigatorItem;
}
export interface NavigatorQuickPickItem extends vscode.QuickPickItem {
  label: string;
  description: string;
  picked: boolean;
  alwaysShow: boolean;
  filePath: string;
  data?: NavigatorItem;
  buttons?: vscode.QuickInputButton[];
  detail?: string;
}
export interface NavigatorCategoryItem extends NavigatorItem {
  readonly type: 'folder';
  expanded: boolean;
  items: NavigatorItem[];
  data?: NavigatorItem;
}

export interface NavigatorQuickPickItem extends vscode.QuickPickItem {  data?: NavigatorItem;}


export class NavigatorItem extends vscode.TreeItem {
  public children?: NavigatorItem[];
  public detail?: string;

  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public filePath: string = '',
    public type?: 'file' | 'url' | 'command' | 'category' | 'folder' | 'md' | 'snippet' | 'powershellCommand',
    public hasChildren?: boolean,
    detail?: string
  ) {
    super(label, collapsibleState);
    this.contextValue = type || 'file';
    this.detail = detail;

    if (type === 'file') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.iconPath = new vscode.ThemeIcon('file');
    } else if (type === 'snippet') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.iconPath = new vscode.ThemeIcon('symbol-snippet');
    } else if (type === 'md') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.iconPath = new vscode.ThemeIcon('markdown');
    } else if (type === 'url') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.parse(filePath)],
        title: 'Open URL'
      };
      this.iconPath = new vscode.ThemeIcon('link-external');
    } else if (type === 'command') {
      this.command = {
        command: 'ocrmnavigator.executeCommand',
        arguments: [this],
        title: 'Run: ' + label
      };
      this.iconPath = new vscode.ThemeIcon('terminal');
    } else if (type === 'powershellCommand') {
      this.command = {
        command: 'ocrmnavigator.executeItem',
        arguments: [this],
        title: 'Run: ' + label
      };
      this.iconPath = new vscode.ThemeIcon('play');
    } else if (type === 'folder') {
      this.iconPath = new vscode.ThemeIcon('folder');
    } else {
      this.iconPath = new vscode.ThemeIcon('file');
    }

    this.tooltip = filePath || label;
  }
}

export class NavigatorItem extends vscode.TreeItem {
  public children?: NavigatorItem[];
  public detail?: string;

  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public filePath: string = '',
    public type?: 'file' | 'url' | 'command' | 'category' | 'folder' | 'md' | 'snippet' | 'powershellCommand',
    public hasChildren?: boolean,
    detail?: string
  ) {
    super(label, collapsibleState);
    this.contextValue = type || 'file';
    this.detail = detail;

    if (type === 'file') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.iconPath = new vscode.ThemeIcon('file');
    } else if (type === 'snippet') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.iconPath = new vscode.ThemeIcon('symbol-snippet');
    } else if (type === 'md') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.iconPath = new vscode.ThemeIcon('markdown');
    } else if (type === 'url') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.parse(filePath)],
        title: 'Open URL'
      };
      this.iconPath = new vscode.ThemeIcon('link-external');
    } else if (type === 'command') {
      this.command = {
        command: 'ocrmnavigator.executeCommand',
        arguments: [this],
        title: 'Run: ' + label
      };
      this.iconPath = new vscode.ThemeIcon('terminal');
    } else if (type === 'powershellCommand') {
      this.command = {
        command: 'ocrmnavigator.executeItem',
        arguments: [this],
        title: 'Run: ' + label
      };
      this.iconPath = new vscode.ThemeIcon('play');
    } else if (type === 'folder') {
      this.iconPath = new vscode.ThemeIcon('folder');
    } else {
      this.iconPath = new vscode.ThemeIcon('file');
    }

    this.tooltip = filePath || label;
  }
}


export class NavigatorProvider implements vscode.TreeDataProvider<NavigatorItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<NavigatorItem | undefined | null | void> = new vscode.EventEmitter<NavigatorItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<NavigatorItem | undefined | null | void> = this._onDidChangeTreeData.event;
  private firstItem: NavigatorItem | undefined;
  public config: NavigatorConfig | null = null;
  private configWatcher: vscode.FileSystemWatcher;
  private _items: NavigatorItem[] = [];

  // Getter for items
  get items(): NavigatorItem[] {    return this._items;  }

  // Add these properties to your NavigatorProvider class
  private searchText: string = '';
  private searchInFileContents: boolean = false;
  // Add missing property for fileContentSearchResults
  private fileContentSearchResults: NavigatorItem[] = [];

  constructor(private workspaceRoot: string, private configPath: string) {
    this.configWatcher = vscode.workspace.createFileSystemWatcher(configPath);
    this.configWatcher.onDidChange(() => this.loadConfig());
    this.configWatcher.onDidCreate(() => this.loadConfig());
    this.configWatcher.onDidDelete(() => { this.config = null; this.refresh(); });
    this.loadConfig();
  }

  public loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(configContent) as NavigatorConfig;


      if (!config.categories || !Array.isArray(config.categories)) {
        throw new Error('Invalid config format: missing categories array');
      }

      // Validate commands in config
      config.categories?.forEach(category => {
        category.items?.forEach(item => {
          if (item.type === 'command' && !item.cmd?.trim()) {
            console.warn(`Empty command found in item: ${item.label}`);
          }
        });
      });

      this.config = config;
      this.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed to load navigator config:', message);
      vscode.window.showErrorMessage(`Config error: ${message}`);
      this.config = null;
    }
  }

  getFirstItem(): NavigatorItem | undefined { return this.firstItem; }
  refresh(): void { this._onDidChangeTreeData.fire(); }
  getTreeItem(element: NavigatorItem): vscode.TreeItem { return element; }

  getChildren(element?: NavigatorItem): Thenable<NavigatorItem[]> {
    console.log('getChildren called', element ? `for ${element.label}` : 'for root');

    if (element?.children) { return Promise.resolve(element.children); }

    if (!this.config) {
      console.log('No config loaded');
      return Promise.resolve([
        new NavigatorItem(
          'Config file not found or invalid',
          vscode.TreeItemCollapsibleState.None
        )
      ]);
    }

    if (!element) {
      const items = (this.config.categories || []).map(category => {
        return new NavigatorItem(
          category.label,
          category.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
          '',
          'folder'
        );
      });

      if (items.length > 0) {
        this.firstItem = items[0];
      }

      return Promise.resolve(items);
    }

    // Handle category items
    const category = this.config.categories?.find(c => c.label === element.label) as NavigatorCategoryItem;
    // In getChildren method:
    if (category) {
      const categoryItems = 'items' in category ? category.items : [];
      return Promise.resolve(
        categoryItems.map(item => {
          if (item.type === 'folder') {
            const folderItem = item as NavigatorCategoryItem;
            const navItem = new NavigatorItem(
              folderItem.label,
              folderItem.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
              folderItem.filePath || '',
              'folder',
              true
            );

            if ('items' in folderItem) {
              navItem.children = folderItem.items.map(subItem =>
                this.createFileItem(subItem.label, subItem.path || '', subItem.type || 'file')
              );
            }

            return navItem;
          }
          return this.createFileItem(item.label, item.path || '', item.type || 'file');
        })
      );
    }

    return Promise.resolve([]);
  }


  private createFileItem(
    label: string,
    pathOrCmd: string,
    type?: string,
    items?: NavigatorItem[],
    expanded?: boolean
  ): NavigatorItem {
    const fullPath = path.isAbsolute(pathOrCmd)
      ? pathOrCmd
      : path.join(this.workspaceRoot, pathOrCmd);

    if (!type) {
      if (pathOrCmd.match(/^https?:\/\//)) {
        type = 'url';
      } else if (pathOrCmd.startsWith('command:')) {
        type = 'command';
      } else {
        type = 'file';
      }
    }


    if (type === 'url') {
      return new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        pathOrCmd,
        'url'
      );
    } else if (type === 'command') {
      return new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        pathOrCmd,
        'command'
      );
    } else if (type === 'powershellCommand') {
      return new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        pathOrCmd,
        'powershellCommand'
      );
    } else if (type === 'md') {
      const item = new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        fullPath,
        'md'
      );
      return item;
    } else if (type === 'snippet') {
      const item = new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        fullPath,
        'snippet'
      );
      return item;
    } else if (type === 'folder' && items) {
      const folderItem = new NavigatorItem(
        label,
        expanded
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.Collapsed,
        pathOrCmd || '',
        'folder',
        true
      );

      // Create children for the virtual folder
      folderItem.children = items.map(item =>
        this.createFileItem(item.label, item.path || '', item.type)
      );

      return folderItem;
    } else {
      const exists = fs.existsSync(fullPath);
      const item = new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        fullPath,
        'file'
      );

      if (!exists) {
        item.contextValue = 'missing';
        item.iconPath = new vscode.ThemeIcon('warning');
        item.tooltip = `File not found: ${fullPath}\nClick to edit config`;
        item.command = {
          command: 'ocrmnavigator.editConfig',
          title: 'Fix Path in Config'
        };
      }

      return item;
    }
  }
  async getAllItems(): Promise<NavigatorItem[]> {
    if (!this.config) return [];

    const items: NavigatorItem[] = [];

    const collectItems = (itemsArray: NavigatorItem[]) => {
      for (const item of itemsArray) {
        // Create the basic item
        const newItem = this.createFileItem(
          item.label,
          item.path || '',
          item.type,
          isCategoryItem(item) ? item.items : undefined,
          isCategoryItem(item) ? item.expanded : undefined
        );

        items.push(newItem);

        // Recursively collect nested items if this is a category/folder
        if (isCategoryItem(item)) {
          collectItems(item.items);
        }
      }
    };

    // Helper type guard
    function isCategoryItem(item: NavigatorItem): item is NavigatorCategoryItem {
      return item.type === 'folder' && 'items' in item;
    }

    // Collect from all categories
    for (const category of this.config.categories) {
      collectItems(category.items);
    }

    console.log('Collected items:', items);
    return items;
  }
  // You might already have a method like this that you can use instead
  getAllNavigatorItems(): NavigatorItem[] {
    // Collect all items from your tree data
    const allItems: NavigatorItem[] = [];

    // Logic to collect all items from your data structure
    // For example, recursively traversing your tree
    const collectItems = (items: NavigatorItem[]) => {
      for (const item of items) {
        allItems.push(item);
        if (item.children) {
          collectItems(item.children);
        }
      }
    };

    // Start from your root items
    collectItems(this.items || []);

    return allItems;
  }
  // Add these methods to NavigatorProvider class
  public setSearchText(text: string): void {
    this.searchText = text;
    this.refresh();
  }

  public setSearchInFileContents(value: boolean): void {
    this.searchInFileContents = value;
    if (this.searchText) {
      this.refresh(); // Only refresh if there's an active search
    }
  }

  // Add a getter method for the search option
  public getSearchInFileContents(): boolean {
    return this.searchInFileContents;
  }

  // Add this method to get quick pick search results
  public async getQuickPickSearchResults21(searchText: string): Promise<vscode.QuickPickItem[]> {
    const results: vscode.QuickPickItem[] = [];
    if (!this.config) return results;

    // Search through config items
    for (const category of this.config.categories) {
      this.searchInCategory(category, searchText, results);
    }

    // If toggled on, search in file contents
    if (this.searchInFileContents && searchText.length > 2) { // Only search files if at least 3 chars
      await this.searchInFiles(searchText, results);
    }

    return results;
  }

  // Add methods to search through config and files
  private searchInCategory(category: NavigatorCategoryItem, searchText: string, results: vscode.QuickPickItem[]): void {
    // Check if category name matches
    if (category.label.toLowerCase().includes(searchText.toLowerCase())) {
      results.push({
        label: `$(folder) ${category.label}`,
        description: 'Category'
      });
    }

    // Search through items
    for (const item of category.items) {
      if (item.label.toLowerCase().includes(searchText.toLowerCase())) {
        const icon = this.getIconForType(item.type || 'file');
        results.push({
          label: `${icon} ${item.label}`,
          description: item.path || '',
          detail: `In ${category.label}`
        });
      }

      // Search in nested folders
      if (item.type === 'folder' && 'items' in item) {
        this.searchInCategory(item as NavigatorCategoryItem, searchText, results);
      }
    }
  }

  // Helper to get icon for item type
  private getIconForType(type: string): string {
    switch (type) {
      case 'folder': return '$(folder)';
      case 'file': return '$(file)';
      case 'url': return '$(link-external)';
      case 'command': return '$(terminal)';
      case 'md': return '$(markdown)';
      case 'snippet': return '$(symbol-snippet)';
      case 'powershellCommand': return '$(play)';
      default: return '$(file)';
    }
  }

  // Method to search through actual file contents
  private async searchInFiles(searchText: string, results: vscode.QuickPickItem[]): Promise<void> {
    // Get all file paths from config
    // Fix: Define a proper interface for file paths
    interface FilePathInfo {
      path: string;
      label: string;
    }

    const filePaths: FilePathInfo[] = [];

    const collectPaths = (items: any[]) => {
      for (const item of items) {
        if (item.type === 'file' || item.type === 'md' || item.type === 'snippet') {
          if (item.path && !item.path.startsWith('http')) {
            const fullPath = path.isAbsolute(item.path)
              ? item.path
              : path.join(this.workspaceRoot, item.path);
            filePaths.push({
              path: fullPath,
              label: item.label
            });
          }
        }

        // Check for nested items
        if (item.items) {
          collectPaths(item.items);
        }
      }
    };

    // Collect paths from all categories
    for (const category of this.config!.categories) {
      collectPaths(category.items);
    }

    // Search through each file
    for (const fileInfo of filePaths) {
      try {
        if (fs.existsSync(fileInfo.path)) {
          const content = fs.readFileSync(fileInfo.path, 'utf8');

          if (content.toLowerCase().includes(searchText.toLowerCase())) {
            // Find the line containing the match
            const lines = content.split('\n');
            const matchingLineIndex = lines.findIndex(line =>
              line.toLowerCase().includes(searchText.toLowerCase())
            );

            const matchingLine = matchingLineIndex !== -1
              ? lines[matchingLineIndex].trim()
              : '';

            results.push({
              label: `$(search) ${fileInfo.label}`,
              description: path.basename(fileInfo.path),
              detail: matchingLine ? `Line ${matchingLineIndex + 1}: ${matchingLine}` : 'Match in file'
            });
          }
        }
      } catch (error) {
        console.error(`Error searching file ${fileInfo.path}:`, error);
      }
    }
  }

  // Update your tree view to handle search results
  public getSearchResults(): Thenable<NavigatorItem[]> {
    if (!this.searchText || !this.config) {
      return Promise.resolve([]);
    }

    const results: NavigatorItem[] = [];
    const searchText = this.searchText.toLowerCase();

    // Helper to add matching item
    const addMatchingItem = (item: any, category: string) => {
      const navItem = this.createFileItem(
        item.label,
        item.path || '',
        item.type || 'file'
      );

      // Add category context to the tooltip
      navItem.tooltip = `${navItem.tooltip}\n(In ${category})`;

      results.push(navItem);
    };

    // Search in categories and items
    for (const category of this.config.categories) {
      // Check if category name matches
      if (category.label.toLowerCase().includes(searchText)) {
        results.push(new NavigatorItem(
          `${category.label} (Category)`,
          vscode.TreeItemCollapsibleState.None,
          '',
          'folder'
        ));
      }

      // Search in items
      this.searchInItems(category.items, searchText, category.label, results, addMatchingItem);
    }

    // If enabled, search in file contents
    if (this.searchInFileContents && searchText.length > 2) {
      // Add a placeholder while searching files
      results.push(new NavigatorItem(
        '-- Searching file contents... --',
        vscode.TreeItemCollapsibleState.None
      ));

      // Start file search asynchronously and refresh again when done
      this.searchFileContents(searchText).then(() => {
        this.refresh();
      });
    }

    return Promise.resolve(results);
  }

  // Helper to search through items
  private searchInItems(items: any[], searchText: string, categoryName: string,
    results: NavigatorItem[], addMatchingFn: Function): void {
    for (const item of items) {
      // Check if item label matches
      if (item.label.toLowerCase().includes(searchText)) {
        addMatchingFn(item, categoryName);
      }

      // If it's a folder, search inside it
      if (item.type === 'folder' && item.items) {
        this.searchInItems(item.items, searchText, `${categoryName} > ${item.label}`, results, addMatchingFn);
      }
    }
  }

  // Method to search file contents and update results
  private async searchFileContents(searchText: string): Promise<void> {
    // Implement file content search similar to getQuickPickSearchResults method
    // but store results to be shown in the tree view
    this.fileContentSearchResults = []; // Clear previous results

    // Get all file paths from config
    interface FilePathInfo {
      path: string;
      label: string;
      category: string;
    }

    const filePaths: FilePathInfo[] = [];

    // Collect paths (similar to the implementation in getQuickPickSearchResults)
    // Add implementation here

    // Search through each file
    // Add implementation here

    // No need to return anything, we'll refresh the view when done
  }

  public handleSearchResultSelection(item: vscode.QuickPickItem & NavigatorItem): void {
    if (!item.type) return;
    console.log(item.label, item.type, 'item')
    // Match EXACTLY what happens when clicking items in the tree view
    switch (item.type) {
      case 'file':
      case 'md':
      case 'snippet':
        // Same as left-click - opens the file
        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(item.filePath));
        break;

      case 'url':
        // Same as left-click - opens the URL
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(item.filePath));
        break;

      case 'command':
        // Same as left-click - executes the command
        if (item.cmd) {
          vscode.commands.executeCommand('ocrmnavigator.executeCommand', {
            label: item.label,
            cmd: item.cmd,
            type: 'command'
          });
        }
        break;

      case 'powershellCommand':
        // Same as left-click - executes the PowerShell command
        vscode.commands.executeCommand('ocrmnavigator.executeItem', {
          label: item.label,
          path: item.filePath,
          type: 'powershellCommand'
        });
        break;

      case 'folder':
        // For folders - focuses it in the tree view
        this.revealItemInTree(item);
        break;

      default:
        vscode.window.showWarningMessage(`No action defined for ${item.type} items`);
    }
  }

  async getQuickPickSearchResults(text: string): Promise<vscode.QuickPickItem[]> {
    console.log("Search term:", text);
    console.log("Search options:", this.getSearchInFileContents());

    // Get all items
    const allItems = await this.getAllItems();

    // Early return if no search text
    if (!text.trim()) {
      return [];
    }

    try {
      // Perform fuzzy search
      const searchResults = advancedFuzzyFilter(
        allItems,
        text,
        ['label', 'description', 'filePath'],
      );
      console.log("Search term:", text);

      // Convert results to QuickPickItems - NOTE THE .item ACCESSOR
      return searchResults.map(({ item }) => ({
        label: item.label,
        description: typeof item.description === 'string' ? item.description : undefined,
        detail: item.filePath || undefined,
        data: item
      }));
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to simple search
      const searchLower = text.toLowerCase();
      return allItems
        .filter(item => {
          const labelMatch = item.label.toLowerCase().includes(searchLower);
          const descMatch = typeof item.description === 'string'
            ? item.description.toLowerCase().includes(searchLower)
            : false;
          return labelMatch || descMatch;
        })
        .map(item => ({
          label: item.label,
          description: typeof item.description === 'string' ? item.description : undefined,
          detail: item.filePath || undefined,
          data: item
        }));
    }
  }

  private async revealItemInTree(item: NavigatorItem): Promise<void> {
    // Get the tree view by its ID
    const treeView = vscode.window.createTreeView('ocrmnavigatorNavigator', {
      treeDataProvider: this // Assuming this class is the TreeDataProvider
    });

    // Reveal the item in the tree view
    await treeView.reveal(item, { select: true, focus: true });

    // Dispose of the tree view reference to avoid memory leaks
    treeView.dispose();
  }



  dispose() { this.configWatcher.dispose(); }
}