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