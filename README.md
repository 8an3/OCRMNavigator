# OCRM Navigator Extension

![Extension Icon](icon.png)  
*A powerful file navigator from The Opinionated*

## Features

- **Customizable File Tree**: Organize your project files in logical categories
- **Quick Access**: Jump to frequently used files with one click
- **Smart Path Resolution**: Handles both relative and absolute paths
- **Configurable UI**: 
  - Collapsible categories
  - File status indicators (missing files show warning icons)
- **Edit Config**: Quickly modify your navigation structure

## Installation

1. **From VSIX** (local installation):
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
Navigation
Click any item to open the file

Right-click for context menu options

## Commands
Command	Description	Shortcut
Edit Config	Open configuration file	Edit Icon
Reveal in Explorer	Show file in system explorer	Right-click → Reveal
Copy Path	Copy absolute file path	Right-click → Copy
Status Bar
Click the Gear Icon icon to quickly edit config

## Development
Build
```bash
npm install
npm run package
```
Test

Install the VSIX

Open test workspace

Verify navigation works

## Troubleshooting
Q: My files aren't appearing
A: Check:

Paths in config are correct

Files exist at specified locations

View is refreshed (Ctrl+R or command palette → "Refresh Navigator")

Q: Config changes aren't applying
A: The extension auto-reloads on save. If not:

Manually run "Refresh Navigator"

Check Output → Log (Extension Host) for errors

## Contributing
Fork the repository

Create feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/AmazingFeature)

Open Pull Request

## Enjoy organized navigation! 🚀
