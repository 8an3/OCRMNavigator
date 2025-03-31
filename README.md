# OCRMNavigator 

[![Version](https://img.shields.io/badge/version-1.0.2-blue)](https://marketplace.visualstudio.com/items?itemName=skyler.ocrmnavigator)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/8an3/OCRMNavigator/blob/main/LICENSE)

Basically, whatever you can think of, can be pinned in the pane. Replace a dozen or so extensions, while doing a better in the process. 
Quick overview:

1. Bookmark files, urls, VS Code commands, powershell commands, md files, snippets, to do lists, and on and on.
2. Extremely easy to use interface, you dont need the docs. Just right click it.
3. VS Code command reference sheet larger, than anywhere else I could find. In the market place or online.
4. Modern md editor, never leaving the editor. Create a file, with a renderer, or if you want even a third editor with a md reference sheet.
5. Rename batches of files at once.
6. Modern snippet editor, and obviously organizer. Create in a tsx file, edit in a tsx file. No weird uis that dont well.
7. With user experience in mind first, its extremely intuitive to do, just about anything. Some things still need to be tighten up but that never ends. Obviously there will be things that are not so easy to notice. ie: cant implement drag and drop, but was able to come up with a quick work around that takes twice the clicks but since your not actually dragging the item, theres no chance in dropping it before bringing it to your destination.

## [TOC]

I. [Example](#example)
II. [Usage](#usage)
III. [Development](#development)
IV. [Contributing](#contributing)
V. [Roadmap](#roadmap)

### Bookmark types and other features

1. Files 
   1. Just like similar extensions you have quick access to the files you use most.
   2. Add files to custom folders and sub-folders
   3. Edit display labels for files
   4. Remove files from navigation
   5. Copy file paths with one click
   6. Reveal files in system explorer
2. Folders
   1. Create new categories
   2. Rename existing categories
   3. Reorder categories (move up/down)
   4. Delete categories when no longer needed
   5. Sub folders for even more organization
3. URLs 
   1. Instead of opening a browser and rummaging through your bookmarks, its your in your nav panel.
4. VSCode Commands
   1. No limits on how many you can have, you can create as many directories / sub-directories of commands you need or ever want.
   2.  Just a click away.
   3.  Command refernce sheet for those who need it. Didn't add commands as a default, since theres like 150-200 or even more maybe.
   4.  You can search, or view by category.
   5.  I don't know why every extension seems to want to limit you on the amount of extensions you have quick access to. From a quick count you can fit about 43 without scrolling, if you need that many who knows. But with scrolling, you can have all the commands, lol.
5. Powershell Commands
   1.  Same as above
6. Snippets
   1.  Saved in your .vscode just like any other snippets editor on here, but with a bit of a savage, but cherry on top touch.
   2.  Instead of editing and creating with the god awful .vscode format. You create the snippet in a blank .tsx file with your snippet name on the top line.
   3.  You ALSO edit your snippets in a .tsx file, with your snippet name on the top line.
   4.  Your prefix gets created by converting your snippet name to all lower case letters and spaces turning into dashes ( - ). Thus giving you access to your snippets on the fly, just like any other ( Toggle State is then toggle-state as your prefix ).
   5.  No more wasting time with double quotes, or trying to make it look good by lining everything up... just save and fucking code dudes.
   6.  I know theres a work around, but still feels so clunky to us, in a tsx file, then in the snippets, then going back and click on the snippets file again to re render the snippets file and on and on. Where as with this one, you input the name, where you want to store it in the extension and if you already have the snippet in your clipboard it automatically pastes at file creation. Save, then move on to creating the next one. I find its not just the big things that can really waste your time. The small things you dont even notice or count towards wasting your time, but suck so much time out of your day... mainly due to dumb design decisions or the decision NOT to go back to improve it. Thats... basically the whole reason I HAD to start coding.
7. .md files
   1.  Comprehensive cheat sheet you can access any time without leaving vs code.
   2.  Create a md file, that opens a md renderer along side it.
   3.  If you so choose and depends who wide your monitor is, can create an md file with the cheat sheet and renderer open all at once, with one click. Not gonna lie, the little touches with this extension make it nice to have.
8.  Drag and Drop 
   1. Theres no way to actually implement drag and drop as far as I can tell in vscode, but was able to incorporate the next best thing to help quickly move things around without having to dig out the config file.
   2.  With saying that, your more than welcome to do that too.
9.  Config file
   1.  Speaking of which, super easy config file editing, updates as you save in real time.
   2.  Exports straight to your projects root.
   3.  Importing makes it easy to update config or send to friends if they like they way you set yours up.
10. Reveal in explorer
11. Copy path
12. All the while, its pretty quick. Considering some extensions just seem to bog vscode down.
13. Batch rename
    1.  Select file/s in the vscode explorer
    2.  Opens a .txt file with the names in a single column
    3.  Mass edit file names and/or extensions
    4.  Save and filenames will be updated
    5.  Note: currently only saves when you click the save button that appears in the toast, working on getting save on close and on save close file
14. Along with whatever else you can think of... 

> [!NOTE]
> If you see any commands missing from the list, hit me up. That goes for the same markdown styling. Ive noticed not all styling formats work on github, Im not experienced enough with md to know the reasons behind that. For now, Ill only include ones that work on github, but send them to me anyways as I may change my mind. Include a note at the bottom, stating where it works or something. Feature suggestions are welcome as well, whether that be on new features or improving current ones.  
> 


## Example

<details closed>
<summary>Full but shortend example... </summary>

```json
{
  "categories": [
    {
      "label": "CMDS",
      "expanded": false,
      "type": "folder",
      "items": [
        {
          "label": "Save All",
          "path": "workbench.action.files.saveAll",
          "type": "command"
        },
        {
          "label": "Format",
          "path": "editor.action.formatDocument",
          "type": "command"
        },
        {
          "label": "Fold 1",
          "path": "editor.foldLevel1",
          "type": "command"
        },
        {
          "label": "Fold 2",
          "path": "editor.foldLevel2",
          "type": "command"
        },
        {
          "label": "Fold 3",
          "path": "editor.foldLevel3",
          "type": "command"
        },
        {
          "label": "Fold 4",
          "path": "editor.foldLevel4",
          "type": "command"
        },
        {
          "label": "Fold 5",
          "path": "editor.foldLevel5",
          "type": "command"
        },
        {
          "label": "Unfold",
          "path": "editor.unfold",
          "type": "command"
        },
        {
          "label": "Other CMDS",
          "type": "folder",
          "expanded": false,
          "items": [],
          "filePath": ""
        }
      ]
    },
    {
      "label": "PRIMARY",
      "expanded": true,
      "type": "folder",
      "items": [
        {
          "label": "Admin Dashboard",
          "path": "admin/dashboard.tsx",
          "type": "file"
        },
        {
          "label": "Client Dashboard",
          "path": "client/dashboard.tsx",
          "type": "file"
        },
        {
          "label": "Dev Dashboard",
          "path": "/dev/dashboard.tsx",
          "type": "file"
        }
      ]
    },
    {
      "label": "SECONDARY",
      "expanded": false,
      "type": "folder",
      "items": [
        {
          "label": "client website",
          "path": "/dealer/client/home.tsx",
          "type": "file"
        },
        {
          "label": "unit.file",
          "path": "/unit/$file.tsx",
          "type": "file"
        }
      ]
    },
    {
      "label": "COMPONENTS",
      "expanded": false,
      "type": "folder",
      "items": [
        {
          "label": "app.sidebar",
          "path": "/appSidebar.tsx",
          "type": "file"
        },
        {
          "label": "components.shared",
          "path": "/shared/shared.tsx",
          "type": "file"
        },
        {
          "label": "unit.file",
          "path": "/client/FILE.tsx",
          "type": "file"
        }
      ]
    },
    {
      "label": "UTILS",
      "expanded": false,
      "type": "folder",
      "items": [
        {
          "label": "app.env",
          "path": ".env",
          "type": "file"
        },
        {
          "label": "app.packageJSON",
          "path": "package.json",
          "type": "file"
        },
        {
          "label": "app.schemaPrisma",
          "path": "/prisma/schema.prisma",
          "type": "file"
        },
        {
          "label": "app.seed",
          "path": "/prisma/seed.ts",
          "type": "file"
        }
      ]
    },
    {
      "label": "shadCN",
      "expanded": false,
      "type": "folder",
      "items": [
        {
          "label": "Dialog",
          "path": "components/shad/dialog.tsx",
          "type": "file"
        },
      ]
    },
    {
      "label": "WEB",
      "expanded": true,
      "type": "folder",
      "items": [
        {
          "label": "localhost sales dash",
          "path": "http://localhost:3000/portal/sales/dashboard/clients",
          "type": "url"
        },
        {
          "label": "Playlist",
          "path": "https://www.youtube.com",
          "type": "url"
        },
        {
          "label": "Mixes",
          "path": "https://www.youtube.com",
          "type": "url"
        },
        {
          "label": "github repo",
          "path": "https://github.com/8an3/OpinionatedDealerCRM",
          "type": "url"
        },
        {
          "label": "radix",
          "path": "https://www.radix-ui.com",
          "type": "url"
        },
        {
          "label": "vercel",
          "path": "https://vercel.com/",
          "type": "url"
        },
        {
          "label": "lucide",
          "path": "https://lucide.dev/icons/",
          "type": "url"
        },
      ]
    },
    {
      "label": "SNIPPETS",
      "type": "folder",
      "expanded": true,
      "items": [
        {
          "label": "toggle state",
          "path": ".vscode/ocrmnavigator.code-snippets",
          "type": "snippet",
          "collapsibleState": 0,
          "filePath": "toggle-state"

        },
        {
          "label": "user auth",
          "path": ".vscode/ocrmnavigator.code-snippets",
          "type": "snippet",
          "collapsibleState": 0,
          "filePath": "user-auth"

        }
      ],
      "collapsibleState": 1,
      "filePath": ""
    },
    {
      "label": "App Ideas",
      "type": "folder",
      "expanded": true,
      "items": [
        {
          "label": "appIdeas.lawyerApp",
          "path": "code\\notes\\appIdeas.lawyerApp.md",
          "type": "file",
          "collapsibleState": 0,
          "filePath": "code\\notes\\appIdeas.lawyerApp.md"
        }
      ],
      "collapsibleState": 1,
      "filePath": ""
    },
    {
      "label": "Dev Map",
      "type": "folder",
      "expanded": true,
      "items": [],
      "collapsibleState": 1,
      "filePath": ""
    },
     {
      "label": "TO-DO",
      "type": "folder",
      "expanded": true,
      "items": [],
      "collapsibleState": 1,
      "filePath": ""
    },
     {
      "label": "DOCS",
      "type": "folder",
      "expanded": true,
      "items": [],
      "collapsibleState": 1,
      "filePath": ""
    } 
  ]
}
```

</details>


>Along with some others but you get the idea... Never used to, but using 2 nav panes on either side feels good with this extension. As your commands are never too far to use, or too many clicks away.
  
## Usage

##### FILES

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add to CRM Navigator` | Add current file to navigation | Right-click item |
| `Batch Add to CRM Navigator` | Select as many files as you want, the label/name of the file will be taken from the file name without the extension. You pick where you want them by selecting a folder, and all selected files will be saved. | Right-click item |
| `Edit Label` | Change displayed name for file | Right-click item |
| `Moving Files` | Move files to another folder. Theres no drag and drop avaialble, so this is the next best thing. |  In extension pane, right click, select move item. Right click on the destination folder, select as move destination.|
| `Remove File` | Delete item from navigation | Right-click item |
| `Copy Path` | Copy full file path to clipboard | Right-click item |
| `Reveal in Explorer` | Show file in system file explorer | Available by inline and right-click item. |


> [!NOTE]
> Extensions filing system is virtual so the above will not actually be moved anywhere.
> 

##### .MD

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add md` | Creates two windows, one for code editing. The other for rendering the md file. | Dropdown menu  |
| `Add md With Cheat Sheet` | Creates three windows, one for code editing.  he other for rendering the md file. Also opens a third pane with a comprehensive cheet sheet, for all you cheaters. | Dropdown menu   |
| `Edit md Label` | Change displayed name for file | Right-click item |
| `Edit md` | Creates two windows, one for code editing. The other for rendering the md file. | Right-click item |
| `Remove md` | Delete item from navigation | Right-click item |
| `Show md Cheat Sheet` | Comprehensive cheat sheet | Dropdown menu |

> [!NOTE]
> When adding md files, they will be added in a folder in your .vscode for storage, but can be organized any way you want in the extension. This keeps your root directory looking clean, while giving you the organization you need. While at the same time you can retrieve those files painless at anytime.
> 

##### SNIPPETS

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Snippet` | Create new grouping |  Dropdown menu.   |
| `Edit Snippet` | Change category name | Right-click item |
| `Remove Snippet` | Reorder category position | Right-click item |
| `Copy Snippet` |  From the folder pane right clight to copy without having to open it | Right-click item |
| `Remove Snippet` | Reorder category position | Right-click item |


##### FOLDERS

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Folder` | Add folders to nav directory |Dropdown menu. |
| `Add Sub-Folder` | Add sub-folders to nav directory | Right-click item |
| `Expand / Collapse Sub/Folder` | Set default value for folder | Right-click item|

> [!NOTE]
> Same as files above. Folders only go 2 deep. Didn't see the point of going further than that kinda defeats the purpose of this. With the thought in mind, first level are most used items you need, while the collapsed folders are the second most used, and the subfolder being the third. Each folder and be set to open expanded or collapsed as default.
> 

##### URLS

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add URL` | Adds navigable link, taking you straight to the website | Dropdown menu. |
| `Edit URL` | Edit http url |Right-click item |
| `Remove URL` | Removes from extension | Right-click item |

##### COMMANDS

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Command` | Adds button to run vs code commands |Dropdown menu. |
| `Remove Command` | removes from extension | Right-click item |
| `Edit Command` | Allows you to edit the cmd | Right-click item |
| `Show VSCodes Commands Reference` | Cheat shet with over 100+ commands | Dropdown menu. |

##### CONFIG

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Edit Config` | Opens and edits the config file, updates in real time as you save | Dropdown menu. |
| `Import Config` | Import to make changes | Dropdown menu. |
| `Export Config` | Export config to share back up |Dropdown menu. |

##### OTHER

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Refresh Navigator` | Refreshes the pane, loading directly from the config file | Right-click item |
| `Collapse All` | Collapses all folders | Right-click item |

##### FUNCTION OUTSIDE PANE

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Batch Rename` | Select file/s in the vscode explorer pane and open a .txt file to mass edit file names and/or extensions | right-click item. |

> [!NOTE]
> Adding any type of item can also be done by right click the same type in the nav pane. Right clicking on files also allows you to open their corresponding cheat sheet.
> 


## Roadmap

<details closed>
<summary>Details...</summary>

1. Need to include more markdown examples. ie, accordian ( check other readmes for others)
2. SEARCH bar at the top for even quickr access or search for soemthing you know is there but dont remember where alot
4. rename snippet
5.  edit web url label
6.  edit label terminal comands
7.  edit cmd terminal commands
8.  edit command label
8.  edit snipptt label
8.  edit powershel label
9.  delte powershel 

</details>


### Development

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
### Contributing

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

### Support

###### Found an issue? Have a feature request?

Open an Issue

## Snippet Review


### Keep your stick on the ice! 🚀

Skyler


