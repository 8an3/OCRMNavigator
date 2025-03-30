# OCRMNavigator 

[![Version](https://img.shields.io/badge/version-1.0.2-blue)](https://marketplace.visualstudio.com/items?itemName=skyler.ocrmnavigator)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/8an3/OCRMNavigator/blob/main/LICENSE)

A VS Code extension for bookmarking files, URLs, commands, snippets ( along with creating and editing them, unlike any other ), bookmark and create .md file, to-do lists, docs, and more. 

All in one navigation pane... instead of 6-7 extensions spread accross vscodes entire interface or configs buried somewhere in the 1000s of lines of preferences, or even in some config file thrown, god only knows, how many folders deep into your files system. 

All the while these same extensions bug and / or crash out all the time, always seems to happen when you need to use it, not the hours long coding session before. 

Creating, editing and so on, all done in one navigation pane. No more preference/config digging or searching.

Turning a rather un-user-friendly experience, into something a lot better and giving you easier access to whatever is you need as you need it. 

### Bookmark types and other features
- Files - Just like similar extensions you have quick access to the files you use most.
- URLs - Instead of opening a browser and rummaging through your bookmarks, its your in your nav panel.
- Commands - No limits on how many you can have, you can create as many directories / sub-directories of commands you need or ever want. Just a click away. Also, theres a command refernce sheet for those who need it. Didn't add commands as a default, since theres like 150-200 of them that would be stupid. But you can search, or view by category. I don't know why every extension seems to want to limit you on the amount of extensions you have quick access to. From a quick count you can fit about 43 without scrolling, if you need that many who knows. But with scrolling, you can have all the commands, lol.
- Snippets - Saved in your .vscode just like any other snippets editor on here, but with a bit of a savage, but cherry on top touch. Instead of editing and creating with the god awful .vscode format. You create the snippet in a blank .tsx file with your snippet name on the top line. You ALSO edit your snippets in a .tsx file, with your snippet name on the top line. Your prefix gets created by converting your snippet name to all lower case letters and spaces turning into dashes ( - ). Thus giving you access to your snippets on the fly, just like any other ( Toggle State is then toggle-state as your prefix ). No more wasting time with double quotes, or trying to make it look good by lining everything up... just save and fucking code dudes.
- .md files - Not only is there a comprehensive cheat sheet you can access any time without leaving vs code. You can also create a md file, that opens a md renderer with it. You can also, if you so choose and depends who wide your monitor is, can create an md file with the cheat sheet and renderer open all at once, with one click. Not gonna lie, the little touches with this extension make it nice to have. 
- Bookmarking pre-made frequently used components and functions
- Theres no way to actually implement drag and drop as far as I can tell in vscode, but was able to incorporate the next best thing to help quickly move things around without having to dig out the config file. With saying that, your more than welcome to do that too.
- Speaking of which, super easy config file editing, updates as you save in real time. Exports straight to your projects root, which also lets you easily import configs as well.
- Reveal in explorer, plus copy path.
- All the while, its pretty quick. Considering some extensions just seem to bog vscode down.
- Along with whatever else you can think of...

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

Along with some others but you get the idea... Never used to, but using 2 nav panes on either side feels good with this extension. As your commands are never too far to use, or too many clicks away.
  


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
- Visual tree view in Explorer pane
- Vscode commands reference from the dropdown

#### Easy Config Managment
- Copy config file to current root folder
- Upload configuration file


### Usage

This is going to be a little tounge in cheek, as there is no 30 min / 3 hour tutorial videos or 35 pages on how to, just for an .md editor/organizer.
You want to create, either right click on the file or click the menu button at the top of the extensions pane.
You want to edit, great, fucking right click it.
You want to delete, you guessed it... right fucking click it.
That's it.

If you want more...
Need to organize a set of txt or md files, ( to do lists, docs, READMEs, notes, references, or whatever ) make one folder and put them all in that folder. While you use the pane for better organization. The extension uses a virtual filing system, so no matter where the files are, you can organize them as you wish in the extension.

#### Comprehensive Breakdown

1. ***Add File*** - Right click on any file in the system to add to navigator.
2. ***Edit File*** Label - In extension pane, right click, select edit label.
3. **Remove File*** - In extension pane, right click, select remove from navigator. 
4. ***Moving Files*** - Theres no drag and drop avaialble, so this is the next best thing.  
   1. In extension pane, right click, select move item. 
   2. Right click on the destination folder, select as move destination.
5. ***Reveal in explorer*** - Available by inline and right click.
6. ***Copy Path*** - Right click.

Extensions filing system is virtual so the above will not actually be moved anywhere.

7. ***Add md*** - Dropdown menu + In extension pane, right click folder, select add md. 
   1. Creates two windows, one for code editing.
   2. The other for rendering the md file.
8. ***Add md With Cheat Sheet*** - In extension pane, right click folder, select add md with cheat sheet. 
   1. Creates three windows, one for code editing.
   2. he other for rendering the md file.
   3. Also opens a third pane with a comprehensive cheet sheet, for all you cheaters.
9.  ***Remove md*** - In extension pane, right click, select remove md.
10. ***Edit md*** - In extension pane, right click, select edit md. 
    1.  Creates two windows, one for code editing the other for rendered md.
11. ***Edit md Label*** - In extension pane, right click, select edit label.
12. ***Show md Cheat Sheet*** - Dropdown menu.

When adding md files, they will be added in a folder in your .vscode for storage, but can be organized any way you want in the extension. This keeps your root directory looking clean, while giving you the organization you need. While at the same time you can retrieve those files painless at anytime.

13. ***Add Folder*** - Right click, almost anywhere and select add folder. Dropdown menu.
14. ***Add Sub-Folder*** - Right click on parent folder, select add sub folder.
15. ***Expand / Collapse Sub/Folder*** - Right click on parent folder, select add sub folder.

Same as files above. Folders only go 2 deep. Didn't see the point of going further than that kinda defeats the purpose of this. With the thought in mind, first level are most used items you need, while the collapsed folders are the second most used, and the subfolder being the third. Each folder and be set to open expanded or collapsed as default.

16. ***Edit Config*** - Dropdown menu. Updates the config as you save.
17. ***Import Config*** - Dropdown menu. 
18. ***Export Config*** - Dropdown menu. Saves in projects root folder, and you didn't have to google and search 6 sites just to find out where you can get it from.

19. ***Add Snippet*** - Dropdown menu + In extension pane, right click folder, select edit label.
20. ***Edit Snippet*** - In extension pane, right click, select edit label.
21. ***Remove Snippet*** - In extension pane, right click, select remove snippet.

22. ***Add URL*** - Dropdown menu + In extension pane, right click folder, select edit label.
23. ***Edit URL*** - In extension pane, right click, select edit label.
24. ***Remove URL*** - In extension pane, right click, select remove url.

25. ***Add Command*** - Dropdown menu.
26. ***Remove Command*** - In extension pane, right click, select remove command.
27. ***Edit Command*** - In extension pane, right click, select edit command.
28. ***Show VSCodes Commands Reference*** - Dropdown menu.

29. ***Refresh Navigator*** - Dropdown menu.
30. ***Collapse All*** - Dropdown menu.

***To Note*** - Adding any type of item can also be done by right click the same type in the nav pane.

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
Dont waste my time creating something so complicated it takes half my day to learn it, for a tool that didnt even need to be that way. Only to find out it sucks, not only just to use ( from a user experience aspect ) but also crashes out everytime I'm about to use it. On the other end of the spectrum stop building tools that are just horrible. Just because you dont know how to do something, doesnt mean you cant learn. I didnt know how to do code anything in this extension when I started. Started with one goal in mind, a quick access file explorer. That obviously went down the rabbit hole. Wanting to fix every app I use, and hated using ( almost all of them, I'll get to the others later ). It's going to feel good deleting them, never to see them again. Also to whoever designed the snippets format, what the fuck were you smoking that day bud? Sorry, but geeze... we can tell it only took you a day to wrap up and ship it and went, 'fuck it... YEET!!'. Meanwhile, we are apparently forever stuck with this format. But hey atleast I figured out a workaround, that no other dev has thought of. Surprising, since this is my first year coding.

Anyways... 
Atleast have some pride in your work. For example, this will receive updates and changes as time goes on since I don't see myself coding without these features. There will also be more features added down the road.

### Enjoy organized navigation! 🚀

Skyler


