# OCRMNavigator 

[![Version](https://img.shields.io/badge/version-1.0.2-blue)](https://marketplace.visualstudio.com/items?itemName=skyler.ocrmnavigator)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/8an3/OCRMNavigator/blob/main/LICENSE)

A VS Code extension for bookmarking files, URLs, commands, snippets ( along with creating and editing them, unlike any other ), bookmark and create .md file, to-do lists, docs, and more. 

All in one navigation pane... instead of 6-7 extensions spread accross vscodes entire interface or configs buried somewhere in the 1000s of lines of preferences, or even in some config file thrown, god only knows, how many folders deep into your files system. 

All the while these same extensions bug and / or crash out all the time, always seems to happen when you need to use it, not the hours long coding session before. 

Creating, editing and so on, all done in one navigation pane. No more preference/config digging or searching.

Turning a rather un-user-friendly experience, into something a lot better and giving you easier access to whatever is you need as you need it. 

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
3. URLs -Instead of opening a browser and rummaging through your bookmarks, its your in your nav panel.
4. Commands
   1. No limits on how many you can have, you can create as many directories / sub-directories of commands you need or ever want.
   2.  Just a click away.
   3.  Command refernce sheet for those who need it. Didn't add commands as a default, since theres like 150-200 or even more maybe.
   4.  You can search, or view by category.
   5.  I don't know why every extension seems to want to limit you on the amount of extensions you have quick access to. From a quick count you can fit about 43 without scrolling, if you need that many who knows. But with scrolling, you can have all the commands, lol.
5. Snippets
   1.  Saved in your .vscode just like any other snippets editor on here, but with a bit of a savage, but cherry on top touch.
   2.  Instead of editing and creating with the god awful .vscode format. You create the snippet in a blank .tsx file with your snippet name on the top line.
   3.  You ALSO edit your snippets in a .tsx file, with your snippet name on the top line.
   4.  Your prefix gets created by converting your snippet name to all lower case letters and spaces turning into dashes ( - ). Thus giving you access to your snippets on the fly, just like any other ( Toggle State is then toggle-state as your prefix ).
   5.  No more wasting time with double quotes, or trying to make it look good by lining everything up... just save and fucking code dudes.
6. .md files
   1.  Comprehensive cheat sheet you can access any time without leaving vs code.
   2.  Create a md file, that opens a md renderer along side it.
   3.  If you so choose and depends who wide your monitor is, can create an md file with the cheat sheet and renderer open all at once, with one click. Not gonna lie, the little touches with this extension make it nice to have.
7. Quick Access
   1. Bookmarking pre-made frequently used components and functions
   2. All commands available via right-click context menu
   3. Visual tree view in Explorer pane
   4. Vscode commands reference from the dropdown
8. Drag and Drop 
   1. Theres no way to actually implement drag and drop as far as I can tell in vscode, but was able to incorporate the next best thing to help quickly move things around without having to dig out the config file.
   2.  With saying that, your more than welcome to do that too.
9.  Config file
   1.  Speaking of which, super easy config file editing, updates as you save in real time.
   2.  Exports straight to your projects root.
   3.  Importing makes it easy to update config or send to friends if they like they way you set yours up.
10. Reveal in explorer
11. Copy path
12. All the while, its pretty quick. Considering some extensions just seem to bog vscode down.
13. Along with whatever else you can think of...

Full but shortened example: 

- COMMANDS
    - Save All
    - Format
    - Other CMDS ( Sub Folder )

- FILES
    - Admin Dash
    - Client Dash
    - Dev Dash
  
- RELATED FILES
    - Client Facing Website
    - Unit File 

- COMPONENTS
    - App sidebar
    - Shared Components 

- FILES
    - Client Facing Website
    - Unit File 

- WEB
   - site link
   - site link

- SNIPPETS
   - User Auth
   - Toggle State

- TO DO
   - PRIORITY
   - BACKBURNER

- DEV MAP
   - .md file
   - .md file

- Along with some others but you get the idea... Never used to, but using 2 nav panes on either side feels good with this extension. As your commands are never too far to use, or too many clicks away.
  
### Usage

##### FILES

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add to CRM Navigator` | Add current file to navigation | Right-click item |
| `Edit Label` | Change displayed name for file | Right-click item |
| `Moving Files` | Move files to another folder. Theres no drag and drop avaialble, so this is the next best thing. |  In extension pane, right click, select move item. Right click on the destination folder, select as move destination.|
| `Remove File` | Delete item from navigation | Right-click item |
| `Copy Path` | Copy full file path to clipboard | Right-click item |
| `Reveal in Explorer` | Show file in system file explorer | Available by inline and right-click item. |

- ***Note*** Extensions filing system is virtual so the above will not actually be moved anywhere.

##### .MD

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add md` | Creates two windows, one for code editing. The other for rendering the md file. | Dropdown menu  |
| `Add md With Cheat Sheet` | Creates three windows, one for code editing.  he other for rendering the md file. Also opens a third pane with a comprehensive cheet sheet, for all you cheaters. | Dropdown menu   |
| `Edit md Label` | Change displayed name for file | Right-click item |
| `Edit md` | Creates two windows, one for code editing. The other for rendering the md file. | Right-click item |
| `Remove md` | Delete item from navigation | Right-click item |
| `Show md Cheat Sheet` | Comprehensive cheat sheet | Dropdown menu |

- ***Note*** When adding md files, they will be added in a folder in your .vscode for storage, but can be organized any way you want in the extension. This keeps your root directory looking clean, while giving you the organization you need. While at the same time you can retrieve those files painless at anytime.

##### SNIPPETS

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Snippet` | Create new grouping |  Dropdown menu.   |
| `Edit Snippet` | Change category name | Right-click item |
| `Remove Snippet` | Reorder category position | Right-click item |

##### FOLDERS

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Folder` | Add folders to nav directory |Dropdown menu. |
| `Add Sub-Folder` | Add sub-folders to nav directory | Right-click item |
| `Expand / Collapse Sub/Folder` | Set default value for folder | Right-click item|

- ***Note*** Same as files above. Folders only go 2 deep. Didn't see the point of going further than that kinda defeats the purpose of this. With the thought in mind, first level are most used items you need, while the collapsed folders are the second most used, and the subfolder being the third. Each folder and be set to open expanded or collapsed as default.

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

- ***Note*** Adding any type of item can also be done by right click the same type in the nav pane. Right clicking on files also allows you to open their corresponding cheat sheet.

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
Dont waste my time creating something so complicated it takes half my day to learn it, for a tool that didnt even need to be that way. Only to find out it sucks, not only just to use ( from a user experience aspect ) but also crashes out everytime I'm about to use it. On the other end of the spectrum stop building tools that are just horrible. Just because you dont know how to do something, doesnt mean you cant learn. I didnt know how to do code anything in this extension when I started. Started with one goal in mind, a quick access file explorer. That obviously went down the rabbit hole. Wanting to fix every app I use, and hated using ( almost all of them, I'll get to the others later ). It's going to feel good deleting them, never to see them again. Also to whoever designed the snippets format, what the fuck were you smoking that day bud? Sorry, but geeze... we can tell it only took you a day to wrap up and ship it and went, 'fuck it... YEET!!'. Meanwhile, we are apparently forever stuck with this format. But hey atleast I figured out a workaround, that no other dev has thought of. Surprising, since this is my first year coding.

Anyways... 
Atleast have some pride in your work. For example, this will receive updates and changes as time goes on since I don't see myself coding without these features. There will also be more features added down the road.

### Enjoy organized navigation! 🚀

Skyler


