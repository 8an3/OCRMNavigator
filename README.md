# OCRMNavigator Extension

[![Version](https://img.shields.io/badge/version-1.0.2-blue)](https://marketplace.visualstudio.com/items?itemName=skyler.ocrmnavigator)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/8an3/OCRMNavigator/blob/main/LICENSE)

A VS Code extension for managing CRM-related files with custom categorization and quick navigation.

## Features

### File Management
- Add files to custom categories
- Edit display labels for files
- Remove files from navigation
- Copy file paths with one click
- Reveal files in system explorer

### Category Management
- Create new categories
- Rename existing categories
- Reorder categories (move up/down)
- Delete categories when no longer needed

### Quick Access
- All commands available via right-click context menu
- Keyboard shortcuts for common actions
- Visual tree view in Explorer panel

### Quick Access
- Copy config file to current root folder
- Upload configuration file

## Installation

### From VS Marketplace
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "OCRMNavigator"
4. Click Install

### From VSIX File(local installation):
```bash
code --install-extension ocrm-navigator-0.0.1.vsix
```
From Marketplace (when published):

```bash
ext install ocrmnavigator
```
Configuration
Create 
```bash
.vscode/navigator-config.json
```
 in your project:

```json
Copy
{
  "categories": [
    {
      "label": "DASHBOARDS",
      "expanded": true,
      "items": [
        {
          "label": "Admin Dashboard",
          "path": "apps/app/routes/portal/admin/dashboard.tsx"
        }
      ]
    }
  ]
}
```

## Usage

### Basic Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add to CRM Navigator` | Add current file to navigation | Right-click file in Explorer |
| `Edit Label` | Change displayed name for file | Right-click item in Navigator |
| `Remove from Navigator` | Delete item from navigation | Right-click item |
| `Copy Path` | Copy full file path to clipboard | Right-click item |
| `Reveal in Explorer` | Show file in system file explorer | Right-click item |

### Category Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Category` | Create new grouping | Toolbar button |
| `Rename Category` | Change category name | Right-click category |
| `Move Category Up` | Reorder category position | `Alt+Up` |
| `Move Category Down` | Reorder category position | `Alt+Down` |
| `Remove Category` | Delete category and contents | Right-click category |

## Configuration

Edit `navigator-config.json` to customize your navigation structure:

```json
{
  "categories": [
    {
      "name": "Client Documents",
      "files": [
        {"path": "docs/client-agreement.pdf", "label": "Agreement Template"},
        {"path": "templates/proposal.docx", "label": "Proposal Draft"}
      ]
    },
    {
      "name": "Email Templates",
      "files": [
        {"path": "emails/welcome.html", "label": "Welcome Email"}
      ]
    }
  ]
}
```
## Keyboard Shortcuts

| Action               | Shortcut                          |
|----------------------|-----------------------------------|
| Move Category Up     | `Alt + Up Arrow`                 |
| Move Category Down   | `Alt + Down Arrow`               |
| Edit Config          | `Ctrl+Shift+P` → "Edit Navigator Config" |

## Development

```bash
# Clone repository
git clone git@github.com:8an3/OCRMNavigator.git

# Install dependencies
npm install

# Development mode (watches for changes)
npm run watch

# Build package
npm run package

# Run tests
npm test
```
## Contributing

Fork the repository

```bash
Create a feature branch:
git checkout -b feature/your-feature

Commit your changes:
git commit -m 'Add some feature'

Push to the branch:
git push origin feature/your-feature
```

Open a Pull Request

## Support

##### Found an issue? Have a feature request?

Open an Issue

## Enjoy organized navigation! 🚀

Skyler Zanth


