// src/navigatorView.ts
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface NavigatorConfig {
  categories: {
    label: string;
    expanded: boolean;
    items: {
      label: string;
      path: string;
    }[];
  }[];
}


export class NavigatorItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath: string = '',
    public readonly type: 'category' | 'file' = 'file'
  ) {
    super(label, collapsibleState);

    this.contextValue = type;
    
    if (type === 'file') {
      this.command = {
        command: 'vscode.open',
        arguments: [vscode.Uri.file(filePath)],
        title: 'Open File'
      };
      this.tooltip = filePath;
      this.iconPath = new vscode.ThemeIcon('file');
    } else {
      this.iconPath = new vscode.ThemeIcon('folder');
    }
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
        
        // Add validation here
        const config = JSON.parse(configContent);
        if (!config.categories || !Array.isArray(config.categories)) {
            throw new Error('Invalid config format: missing categories array');
        }
        
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
      // Root categories
      const items = this.config.categories.map(category => {
        return new NavigatorItem(
          category.label,
          category.expanded ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed,
          '',
          'category'
        );
      });

      if (items.length > 0) {
        this.firstItem = items[0];
      }

      return Promise.resolve(items);
    }

    // Find the category
    const category = this.config.categories.find(c => c.label === element.label);
    if (category) {
      return Promise.resolve(
        category.items.map(item => this.createFileItem(item.label, item.path))
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

  private createFileItem(label: string, relativePath: string): NavigatorItem {
    const fullPath = path.join(this.workspaceRoot, relativePath);
    const exists = fs.existsSync(fullPath);

    const item = new NavigatorItem(
      label,
      vscode.TreeItemCollapsibleState.None,
      fullPath
    );

  if (!exists) {
    item.contextValue = 'missing';
    item.iconPath = new vscode.ThemeIcon('warning');
    item.tooltip = `File not found: ${fullPath}\nClick to edit config`;
    item.command = {
      command: 'opinionatedCrm.editConfig',
      title: 'Fix Path in Config'
    };
  }

  return item;
}
  dispose() {
    this.configWatcher.dispose();
  }
}