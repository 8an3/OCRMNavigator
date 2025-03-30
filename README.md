# OCRMNavigator 

[![Version](https://img.shields.io/badge/version-1.0.2-blue)](https://marketplace.visualstudio.com/items?itemName=skyler.ocrmnavigator)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/8an3/OCRMNavigator/blob/main/LICENSE)

A VS Code extension for bookmarking files, URLs, commands, snippets ( along with creating and editing them, unlike any other ), bookmark and create .md file, to-do lists, docs, and more. 

All in one navigation pane... instead of 6-7 extensions spread accross vscodes entire interface or configs buried somewhere in the 1000s of lines of preferences, or even in some config file thrown, god only knows, how many folers deep into your files system. 

All the while these same extensions bug and / or crash out all the time, always seems to happen when you need to use it, not the hours long coding session before. 

Creating, editing and so on, all done in one navigation pane. No more preference/config digging or searching.

Turning a rather un-user-friendly experience, into something a lot better and giving you easier access to whatever is you need as you need it. 

### Bookmark types
- Files - Just like similar extensions you have quick access to the files you use most.
- URLs - Instead of opening a browser and go through your bookmarks, its your in your nav panel.
- Commands - No limits on how many you can have, you can create as many directories of commands you need or ever want. Just a click away.
- Snippets - Saved in your .vscode just like any other snippets editor on here, but with a bit of a savage but cherry on top touch. Instead of editing and creating with the god awful .vscode format. You create the snippet in a blank .tsx file with your snippet name on the top line. You ALSO edit your snippets in a .tsx file, with your snippet name on the top. Your prefix changes to all lower case letters and spaces turning into dashes ( - ), so you can still access your snippets on the fly ( Toggle State is then toggle-state as your prefix ). No more wasting time with quotes, or trying to make it look good by lining everything up... just save and fucking code dudes.
- .md files
- Pre-made most used components and functions
- Along with whatever else you can think of...

Full but shortened example: 

COMMANDS
:  Save All
:  Format
:  Other CMDS ( Sub Folder )

FILES
:  Admin Dash
:  Client Dash
:  Dev Dash

RELATED FILES
:  Client Facing Website
:  Unit File 

COMPONENTS
:  App sidebar
:  Shared Components 

WEB
:  site link
:  site link

SNIPPETS
:  User Auth
:  Toggle State

TO DO
:  PRIORITY
:  BACKBURNER

DEV MAP
:  .md file
:  .md file

Along with some others but you get the idea... Never used to, but using 2 panes on either side feels good to use with this. As your commands are never too far to use, or too many clicks away.
  


### Files
#### File Management
- Add files to custom categories
- Edit display labels for files
- Remove files from navigation
- Copy file paths with one click
- Reveal files in system explorer

#### Category Management
- Create new categories
- Rename existing categories
- Reorder categories (move up/down)
- Delete categories when no longer needed
- Sub folders for even more organization

#### Quick Access
- All commands available via right-click context menu
- Keyboard shortcuts for common actions
- Visual tree view in Explorer panel

#### Easy Config Managment
- Copy config file to current root folder
- Upload configuration file


### Usage

This is going to be a little tounge in cheek as there is no 30 min / 3 hour tutorial videos or 35 pages on how to, just for an .md editor/organizer.
You want to create, either right click on the file or click the menu button at the top of the extensions pane.
You want to edit, great, fucking right click it.
You want to delete, you guessed it... right fucking click it.
That's it.

If you want more...
Need to organize a set of txt or md files, ( to do lists, docs, READMEs, notes, references, or whatever ) make one folder and put them all in that folder. While you use the pane for better organization. The extension uses a virtual filing system, so no matter where the files are, you can organize them as you wish in the extension.

Dont waste my time creating something so complicated it takes half my day to learn it, for a tool that didnt even need to be that complicated. Only to find out it sucks, not only just to use ( from a user experience aspect ) but also crashes out everytime I'm about to use it. On the other end of the spectrum stop building tools that are just horrible. Just because you dont know how to do something, doesnt mean you cant learn. I didnt know how to do code anything in this extension when I started. Started with one goal in mind, a quick access file explorer. That obviously went down the rabbit hole. Wanting to fix every app I use, and hated using ( almost all of them, I'll get to the others later ). It's going to feel good deleting them, never to see them again. Also to whoever designed the snippets format, what the fuck were you smoking that day bud? Sorry, but geeze...

#### Basic Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add to CRM Navigator` | Add current file to navigation | Right-click file in Explorer |
| `Edit Label` | Change displayed name for file | Right-click item in Navigator |
| `Remove from Navigator` | Delete item from navigation | Right-click item |
| `Copy Path` | Copy full file path to clipboard | Right-click item |
| `Reveal in Explorer` | Show file in system file explorer | Right-click item |

#### Category Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Add Category` | Create new grouping | Toolbar button |
| `Rename Category` | Change category name | Right-click category |
| `Move Category Up` | Reorder category position | `Alt+Up` |
| `Move Category Down` | Reorder category position | `Alt+Down` |
| `Remove Category` | Delete category and contents | Right-click category |

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

### Enjoy organized navigation! 🚀

Skyler


