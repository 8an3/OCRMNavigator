import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**export interface NavigatorConfig {
  categories: {
    filename?: string;
    items?: {     
      type?: 'file' | 'url' | 'command' | 'snippet'; // Optional if you want
    }[];
  }[];
} */


export interface NavigatorConfig { categories: NavigatorCategoryItem[]; }

export interface NavigatorItem {
  label: string;
  path?: string;
  cmd?: string;
  type?: 'file' | 'url' | 'command' | 'category' | 'folder' | 'md' | 'snippet';
  collapsibleState: vscode.TreeItemCollapsibleState;
  filePath: string;
  children?: NavigatorItem[];
}

export interface NavigatorCategoryItem extends NavigatorItem {
  readonly type: 'folder';
  expanded: boolean;
  items: NavigatorItem[];
}

export class NavigatorItem extends vscode.TreeItem {
  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public filePath: string = '',
    public type?: 'file' | 'url' | 'command' | 'category' | 'folder' | 'md' | 'snippet',
    public hasChildren?: boolean,
  ) {
    super(label, collapsibleState);
    this.contextValue = type || 'file';

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
    if (category) {
      const categoryItems = category.items || [];
      return Promise.resolve(
        categoryItems.map(item => {
          // Check if this item is a folder
          if (item.type === 'folder') {
            // Cast to NavigatorCategoryItem to access its properties properly
            const folderItem = item as NavigatorCategoryItem;

            const navItem = new NavigatorItem(
              folderItem.label,
              folderItem.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
              folderItem.filePath || '',
              'folder',
              true
            );

            // Create the children for this folder
            navItem.children = (folderItem.items || []).map(subItem =>
              this.createFileItem(
                subItem.label,
                subItem.path || '',
                subItem.type || 'file'
              )
            );

            return navItem;
          }

          // For non-folder items
          return this.createFileItem(
            item.label,
            item.path || '',
            item.type || 'file'
          );
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


  dispose() { this.configWatcher.dispose(); }
}