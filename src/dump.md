 ```json
 {  "ocrmnavigator.viewActions": [
        {
          "command": "ocrmnavigator.createSnippet",
          "title": "Create New Snippet",
          "icon": "$(add)"
        },
        {
          "command": "ocrmnavigator.addCommand",
          "title": "Add New Command",
          "icon": "$(terminal)"
        },
        {
          "command": "ocrmnavigator.refresh",
          "title": "Refresh View",
          "icon": "$(refresh)"
        },
        {
          "command": "ocrmnavigator.editConfig",
          "title": "Edit Config",
          "icon": "$(edit)"
        },
         {
          "command": "ocrmnavigator.exportConfig",
          "title": "Export Config",
          "icon": "$(export)",
              "group": "navigation@1"
        },
        {
          "command": "ocrmnavigator.importConfig",
          "title": "Import Config",
          "icon": "$(import)",
              "group": "navigation@1"
        },
        {
          "command": "ocrmnavigator.viewActions",
          "when": "view == ocrmnavigatorNavigator",
          "group": "navigation",
          "icon": "$(gear)"
        },
      {
        "command": "ocrmnavigator.viewActions",
        "title": "viewActions",
        "category": "OCRM Navigator"
      },
        {
          "submenu": "ocrmnavigator.actions",
          "when": "view == ocrmnavigatorNavigator",
          "group": "navigation"
        }
      ] 
 }
 ```