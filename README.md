### OCRMNavigator
Basically, whatever you can think of, can be pinned in the quick access pane. Replacing a dozen or so extensions, all the while doing what it needs to do, but better.

---------------------------

- I. [Example](#example)
- II. [Usage](#usage)
- III. [Development](#development)
- IV. [Contributing](#contributing)
- V. [Roadmap](#roadmap)

## Overview

### Virtual filing system

1. Files
    -   [x] Just like similar extensions you have quick access to the files you use most.
    -   [x] Add files to custom folders and sub-folders
    -   [x] Edit display labels for files
    -   [x] Remove files from navigation
    -   [x] Copy file paths with one click
    -   [x] Reveal files in system explorer
2. Folders
    -   [x] Create new categories
    -   [x] Rename existing categories
    -   [x] Reorder categories (move up/down)
    -   [x] Delete categories when no longer needed
    -   [x] Sub folders for even more organization
    -   [x] Right and click type movement
    -   [x] For smaller movements, move up or down one
3. URLs
    -   [x] Instead of opening a browser and rummaging through your bookmarks, its your in your nav panel.
4. VSCode Commands
5. PowerShell Commands
6. .md 
7. Snippets



### VSCode Commands
- [x] No limits on how many you can have, you can create as many directories / sub-directories of commands you need or ever want.
 - [x] Just a click away.
 -   [x] Command reference sheet for those who need it. Didn't add commands as a default, since theres like 360 or even more maybe.
-   [x] You can search, or view by category.
-   [x] I don't know why every extension seems to want to limit you on the amount of extensions you have quick access to. From a quick count you can fit about 43 without scrolling, if you need that many who knows. But with scrolling, you can have all the commands, lol.
   
### PowerShell Commands
- [x] Same as commands above

### Snippets
- Creating
	 - [x] Saved in your .vscode just like any other snippets editor on here, but with a bit of a savage, but cherry on top touch.
	- [x] Instead of editing and creating with the god awful .vscode format. You create the snippet in a blank .tsx file with your snippet name on the top line.
- Editing
	 - [x] You ALSO edit your snippets in a .tsx file, with your snippet name on the top line.
- Formating
	 - [x] Your prefix gets created by converting your snippet name to all lower case letters and spaces turning into dashes ( - ). Thus giving you access to your snippets on the fly, just like any other ( Toggle State is then toggle-state as your prefix ).
	 - [x] No more wasting time with double quotes, or trying to make it look good by lining everything up... just save and fucking code dudes.
	 - [x] I know theres a work around, but still feels so clunky to us, in a tsx file, then in the snippets, then going back and click on the snippets file again to re render the snippets file and on and on. Where as with this one, you input the name, where you want to store it in the extension and if you already have the snippet in your clipboard it automatically pastes at file creation. Save, then move on to creating the next one. I find its not just the big things that can really waste your time. The small things you dont even notice or count towards wasting your time, but suck so much time out of your day... mainly due to dumb design decisions or the decision NOT to go back to improve it. Thats... basically the whole reason I HAD to start coding.

 #### Extended the functionality of our snippets.
 
- [x] New Full featured Viewer, from the viewer with search command to search and view the filtered list, after selecting bring you to a viewer. Where you can view, select to edit, create new, remove and now even includes the easiest importer Ive seen yet when dealer with snippets
- [x] Import by letting you select whatever snippet file you want, leaves the original untouched but copies over into its snippet file, when importing, if you do not already have a SNIPPETS folder it will create it for you in the extensions pane so you can access them in the extensions file structure. Thus letting you import 2 or 3 snippet files if you need to.


### .md Editor & Viewer & Notes App

#### .md Viewer & Editor
- [x] Comprehensive cheat sheet you can access any time without leaving vs code.
- [x] Create a md file, that opens a md renderer along side it.
- [x] If you so choose and depends who wide your monitor is, can create an md file with the cheat sheet and renderer open all at once, with one click. Not gonna lie, the little touches with this extension make it nice to have.

#### .md Notes App

1.  Renderer Bookmarking section
```
- [Priority](#00)
- [Dev](#01)
- [Client Facing Site](#03)
```
2. Saving locally .vscode\ocrmnavigator\\.md where they are currently being saved to
3. uses . as a folder
	- todoList1 would be in root folder
	- two.todoList2 would be one folder two
4. moving items into the priority folder will always receive new number put them at the back of the line
5. This enables quick move of lists and notes to be 'pinned'
6. Move to completed section button
7. easily create link using number system

- use git hub as remote file system for notes
- push on save, on exit/ saves and pushes
- push on delete
- push on move file
- on first load it pulls the repo
- manual push just incase
- search input
  - search and prioorizes titles first and any matching body data second
  - search will have burger menu on left and check box on right flex items center when input is not in use
  - when input is in use the input grows pushing them off the screen till user cancels search input by click outof the box or when they select a list or note to navigate to
- file types
  - note
  - todo
  - reminder
- Reminders   
  -  get delete on exit
  - every new quarter of the hour will check dates on reminders to see if they should go off while they are working
  - on load check date if in paste start load with reminder / reminders
  - that way you can remind your self of important coding tasks
- Sort system
  - Numbering system
    - first is number system #### 00 date type inside accordian will include below for reference
    - Both will receivng top section on creation
  - Label system
    - Second sort type will be labeling
    - Will not be included with numbering system when md viewer loads but will be sorted together with other labels first at the top of the list with their matching labels acting as groups and then the numbering system afterwards notes come afterwards
  - Allows user to have 2 types of to do lists for example one for personal stuff the other for coding projects
  - Two types of notes
  - Share to do / note? how the fuck would that work?
- Architecture Overview
	- GitHub as the Source of Truth
		- Single repository stores all .md/.txt files
		- Consistent folder structure makes navigation easy
		- Git's version control gives you history and conflict resolution
	- Mobile App Implementation
		- GitHub authentication flow
		- Background sync (auto-push after changes)
		- Pull on app startup to get latest changes
		 - When pulling locally, new files would be added to filing system under md
	- VS Code Extension Implementation
		- Auto-pull when extension activates
		- Commit / push on save
		- Push on label changes
		- Push on virtual folder changes
		- Push on edit


###  Drag and Drop
-   [x] Theres no way to actually implement drag and drop as far as I can tell in vscode, but was able to incorporate the next best thing to help quickly move things around without having to dig out the config file.

### Config file
-   [x] Speaking of which, super easy config file editing, updates as you save in real time.
-   [x] Exports straight to your projects root.
-   [x] Importing makes it easy to update config or send to friends if they like they way you set yours up.
-   [x] Automatically deletes trailing commas on import

### Reveal in explorer


### Copy path

-   [x] All the while, its pretty quick. Considering some extensions just seem to bog vscode down.
-   [x] Batch rename
    -   [x] Select file/s in the vscode explorer
    -   [x] Opens a .txt file with the names in a single column
    -   [x] Mass edit file names and/or extensions
    -   [x] Save and filenames will be updated
    -   [x] Note: currently only saves when you click the save button that appears in the toast, working on getting save on close and on save close file

###  Modern day formatter

-   [x] Whether your brand new or a seasoned user, using and configuring your new formatter will be a breeze.
-   [x] You will not have to visit another site or do a google search to make sure the option your about to activate does, what you think it does.
-   [x] Configurations open in web view, the types will be selectable with tabs, under each tab you view the options, read the description and configure the formatter to be exactly the way you want.
-   [x] I've never seen this else where, but I really wanted it when I was configuring my formatters... and never had it.
-   [x] Live preview to see what your changes do in real time. So if this is your second day coding, you can easily configure without having to do mountais of research.
-   [x] Right click anywhere in the file and select the extensions formatter to activate.
-   [x] Comment json files
-   [x] Gives you the ability
-   [x] already built and tested just want to fix another features before

### json comments
- [x] Right click  on editor


### json comments
- [x] Right click  on editor


### SEARCH bar
- [x] at the top for even quickr access or search for soemthing you know is there but dont remember where alot

### json comments

### json comments



1. Need to include more markdown examples. ie, accordian ( check other readmes for others)
2. 
3. rename snippet ***done***
4. snippet viewer ***done***
5. edit web url label ***done***
6. edit label terminal comands ***done***
7. edit cmd terminal commands ***done***
8. edit command label ***done***
9. edt powershel label ***done***
10. delete powershel ***done***
11. when save or importing config file, check for trailing comma if there ***done***
12. editeable folder icons
13. add a snippet viewer instead of this horse shit ***done***
14. have the commands search search thrgouh all commands not just that dropdowns selectio0n in the vscode comamnd page
15. for quick painless md file import into the extension the .md folder is where all of the md files end up so you can click add, it will oipen the windows file explorer to choose a number of files, it wil ask you for a folder to select in the extensions filing system in vs code, and then add all the md files names into our config file and copy each file over to the .md folder
16. in the vs coode commands web viewer add a second button to add to extensions filing structure under VS Code
17. Share Config File button, ask if they want to share md files, ask if they want to share snippets, ask if the want to share urls, ask if they want to share virtual files. If no to any of them, delete corresponding items, then copy into a newly created folder called share me in the root folder, depending on their answer to the questions the snippets file in the .vscode folder, the md folder and the compoents folder along with the config file with creating a .txt file named read me tell the person they are sharing with copy the folders in .vscode and uplaod the confiog in the extenstion
18. project specific structure, once a project opens, check to see if current project matches the currently loaded one
19. 
20. remove all comments
21. right click .md file in editor to view render since the one u already use sucks ass, not to mention they high jack your styling... like why... i dont want to see your shit color pallete
22. theme builder

23. search buttoin no longer displayionhg

24. how to make check boxes checkable in viewer - maybe create to do file to and make it their own thing, create view certain size so its a small pane



## Usage
 ##### FILES
 
 | Command | Description | Shortcut |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Add to CRM Navigator` | Add current file to navigation | Right-click item |
| `Batch Add to CRM Navigator` | Select as many files as you want, the label/name of the file will be taken from the file name without the extension. You pick where you want them by selecting a folder, and all selected files will be saved. | Right-click item |
| `Edit Label` | Change displayed name for file | Right-click item |
| `Moving Files` | Move files to another folder. Theres no drag and drop avaialble, so this is the next best thing. | In extension pane, right click, select move item. Right click on the destination folder, select as move destination. |
| `Remove File` | Delete item from navigation | Right-click item |
| `Copy Path` | Copy full file path to clipboard | Right-click item |
| `Reveal in Explorer` | Show file in system file explorer | Available by inline and right-click item. |
 
 > [!NOTE]
> Extensions filing system is virtual so the above will not actually be moved anywhere.
>
  ---------------------------

##### .MD

  
| Command | Description | Shortcut |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `Add md` | Creates two windows, one for code editing. The other for rendering the md file. | Dropdown menu |
| `Add md With Cheat Sheet` | Creates three windows, one for code editing. he other for rendering the md file. Also opens a third pane with a comprehensive cheet sheet, for all you cheaters. | Dropdown menu |
| `Edit md Label` | Change displayed name for file | Right-click item |
| `Edit md` | Creates two windows, one for code editing. The other for rendering the md file. | Right-click item |
| `Remove md` | Delete item from navigation | Right-click item |
| `Show md Cheat Sheet` | Comprehensive cheat sheet | Dropdown menu |

  
> [!NOTE]
> When adding md files, they will be added in a folder in your .vscode for storage, but can be organized any way you want in the extension. This keeps your root directory looking clean, while giving you the organization you need. While at the same time you can retrieve those files painless at anytime.
>
>
---------------------------

  ##### SNIPPETS
 
| Command | Description | Shortcut |
| ---------------- | ------------------------------------------------------------------- | ---------------- |
| `Add Snippet` | Create new grouping | Dropdown menu. |
| `Edit Snippet` | Change category name | Right-click item |
| `Remove Snippet` | Reorder category position | Right-click item |
| `Copy Snippet` | From the folder pane right clight to copy without having to open it | Right-click item |
| `Remove Snippet` | Reorder category position | Right-click item |

---------------------------
##### FOLDERS

| Command | Description | Shortcut |
| ------------------------------ | -------------------------------- | ---------------- |
| `Add Folder` | Add folders to nav directory | Dropdown menu. |
| `Add Sub-Folder` | Add sub-folders to nav directory | Right-click item |
| `Expand / Collapse Sub/Folder` | Set default value for folder | Right-click item |


> [!NOTE]
> Same as files above. Folders only go 2 deep. Didn't see the point of going further than that kinda defeats the purpose of this. With the thought in mind, first level are most used items you need, while the collapsed folders are the second most used, and the subfolder being the third. Each folder and be set to open expanded or collapsed as default.
>
---------------------------
  ##### URLS

| Command | Description | Shortcut |
| ------------ | -------------------------------------------------- | ---------------- |
| `Add URL` | Adds navigable link, taking you straight to the website | Dropdown menu. |
| `Edit URL` | Edit http url | Right-click item |
| `Remove URL` | Removes from extension | Right-click item |

---------------------------

  ##### COMMANDS
 

| Command | Description | Shortcut |
| --------------------------------- | ----------------------------------- | ---------------- |
| `Add Command` | Adds button to run vs code commands | Dropdown menu. |
| `Remove Command` | removes from extension | Right-click item |
| `Edit Command` | Allows you to edit the cmd | Right-click item |
| `Show VSCodes Commands Reference` | Cheat shet with over 100+ commands | Dropdown menu. |


##### CONFIG

  | Command | Description | Shortcut |
| --------------- | ----------------------------------------------------------------- | -------------- |
| `Edit Config` | Opens and edits the config file, updates in real time as you save | Dropdown menu. |
| `Import Config` | Import to make changes | Dropdown menu. |
| `Export Config` | Export config to share back up | Dropdown menu. |


---------------------------
  
##### OTHER

| Command | Description | Shortcut |
| ------------------ | --------------------------------------------------------- | ---------------- |
| `Refresh Navigator` | Refreshes the pane, loading directly from the config file | Right-click item |
| `Collapse All` | Collapses all folders | Right-click item |
 

##### FUNCTION OUTSIDE PANE

  
| Command | Description | Shortcut |
| -------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
| `Batch Rename` | Select file/s in the vscode explorer pane and open a .txt file to mass edit file names and/or extensions | right-click item. |

  

> [!NOTE]
> Adding any type of item can also be done by right click the same type in the nav pane. Right clicking on files also allows you to open their corresponding cheat sheet.
>
 
<details  closed>

<summary>Details...</summary>


  

</details>