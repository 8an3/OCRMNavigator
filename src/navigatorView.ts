// src/navigatorView.ts
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


export interface NavigatorConfig {
  categories: NavigatorCategoryItem[];
}

export interface NavigatorItem {
  label: string;
  path?: string;
  cmd?: string;
  type?: 'file' | 'url' | 'command' | 'category' | 'folder';
  collapsibleState: vscode.TreeItemCollapsibleState;
  filePath: string;
  children?: NavigatorItem[];
}

export interface NavigatorCategoryItem extends NavigatorItem {
  readonly type: 'category';
  expanded: boolean;
  items: NavigatorItem[];  // This can remain non-readonly if you need to modify it
}

export class NavigatorItem extends vscode.TreeItem {
  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public filePath: string = '',
    public type?: 'file' | 'url' | 'command' | 'category' | 'folder',
    public children?: NavigatorItem[]
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
    }
    else if (type === 'url') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.parse(filePath)],
        title: 'Open URL'
      };
      this.iconPath = new vscode.ThemeIcon('link-external');
    }
    else if (type === 'command') {
      this.command = {
        command: 'ocrmnavigator.executeCommand',
        arguments: [this],
        title: 'Run: ' + label
      };
      this.iconPath = new vscode.ThemeIcon('terminal');
    }
    else if (type === 'category') {
      this.iconPath = new vscode.ThemeIcon('folder');
 
    }
    else {
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

  constructor(
    private workspaceRoot: string,
    private configPath: string
  ) {
    this.configWatcher = vscode.workspace.createFileSystemWatcher(configPath);
    this.configWatcher.onDidChange(() => this.loadConfig());
    this.configWatcher.onDidCreate(() => this.loadConfig());
    this.configWatcher.onDidDelete(() => {
      this.config = null;
      this.refresh();
    });
    this.loadConfig();
  }

  public loadConfig() {
    try {
      console.log('Loading config from:', this.configPath);
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

  getFirstItem(): NavigatorItem | undefined {
    return this.firstItem;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: NavigatorItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: NavigatorItem): Thenable<NavigatorItem[]> {
    console.log('getChildren called', element ? `for ${element.label}` : 'for root');

    if (element?.children) {
      return Promise.resolve(element.children);
    }

    if (!this.workspaceRoot) {
      console.log('No workspace opened');
      vscode.window.showInformationMessage('No workspace opened');
      return Promise.resolve([]);
    }

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
      // Root categories - ensure categories exists
      const items = (this.config.categories || []).map(category => {
        return new NavigatorItem(
          category.label,
          category.expanded ?
            vscode.TreeItemCollapsibleState.Expanded :
            vscode.TreeItemCollapsibleState.Collapsed,
          '',
          'category'
        );
      });

      if (items.length > 0) {
        this.firstItem = items[0];
      }

      return Promise.resolve(items);
    }

    // Find the category with null checks
    const category = this.config.categories?.find(c => c.label === element.label);
    if (category) {
      // Handle case where items might be undefined
      const categoryItems = category.items || [];
      return Promise.resolve(
        categoryItems.map(item => this.createFileItem(
          item.label,
          item.path || '',
          item.type || 'file' // Explicitly pass undefined if type is not specified
        ))
      );
    }

    return Promise.resolve([]);
  }

  // Add this to the NavigatorProvider class
  private ensureFileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  private createFileItem(label: string, pathOrCmd: string, type?: string): NavigatorItem {
    if (!type) {
      if (pathOrCmd.match(/^https?:\/\//)) type = 'url';
      else if (pathOrCmd.match(/^[\w\.]+\.[\w\.]+$/)) type = 'file';
      else type = 'command';
    }
  
    const fullPath = path.join(this.workspaceRoot, pathOrCmd);
  
    // Handle directories
    if (!type && fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      type = 'folder';
    }
  
    if (type === 'url') {
      return new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        pathOrCmd,
        'url'
      );
    }
    else if (type === 'command') {
      return new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.None,
        pathOrCmd,
        'command'
      );
    }
    else if (type === 'folder') {
      return new NavigatorItem(
        label,
        vscode.TreeItemCollapsibleState.Collapsed,
        fullPath,
        'folder',
        this.getDirectoryItems(fullPath)  // Get children items
      );
    } 
    else {
      // File handling
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


  private getDirectoryItems(dirPath: string): NavigatorItem[] {
    try {
      if (!fs.existsSync(dirPath)) return [];
  
      return fs.readdirSync(dirPath).map(itemName => {
        const itemPath = path.join(dirPath, itemName);
        const isDirectory = fs.statSync(itemPath).isDirectory();
        
        return new NavigatorItem(
          itemName,
          isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
          itemPath,
          isDirectory ? 'folder' : 'file',
          isDirectory ? this.getDirectoryItems(itemPath) : undefined
        );
      });
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      return [];
    }
  }
  
  dispose() { this.configWatcher.dispose(); }
}