export const config = {
    "categories": [
        {
            "label": "APPS",
            "expanded": false,
            "type": "folder",
            "items": []
          },
          {
            "label": "CMDS",
            "expanded": true,
            "type": "folder",
            "items": [
              {
                "label": "toggle terminal",
                "path": "workbench.action.terminal.toggleTerminal",
                "type": "command",
                "collapsibleState": 0,
                "filePath": ""
              },
              {
                "label": "format",
                "path": "editor.action.formatDocument",
                "type": "command"
              },
              {
                "label": "save all",
                "path": "workbench.action.files.saveAll",
                "type": "command"
              },
              {
                "label": "fold 1",
                "path": "editor.foldLevel1",
                "type": "command"
              },
              {
                "label": "fold 2",
                "path": "editor.foldLevel2",
                "type": "command"
              },
              {
                "label": "fold 3",
                "path": "editor.foldLevel3",
                "type": "command"
              },
              {
                "label": "+ vscode cmds",
                "type": "folder",
                "expanded": false,
                "items": [
                  {
                    "label": "fold 4",
                    "path": "editor.foldLevel4",
                    "type": "command"
                  },
                  {
                    "label": "fold 5",
                    "path": "editor.foldLevel5",
                    "type": "command"
                  },
                  {
                    "label": "fold 6",
                    "path": "editor.foldLevel6",
                    "type": "command"
                  },
                  {
                    "label": "fold 7",
                    "path": "editor.foldLevel7",
                    "type": "command"
                  },
                  {
                    "label": "unfoldAll",
                    "path": "editor.unfoldAll",
                    "type": "command"
                  },
                  {
                    "label": "close all editors",
                    "path": "workbench.action.closeAllEditors",
                    "type": "command"
                  },
                  {
                    "label": "toggle word wrap",
                    "path": "editor.action.toggleWordWrap",
                    "type": "command"
                  },
                  {
                    "label": "show commands",
                    "path": "workbench.action.showCommands",
                    "type": "command"
                  },
                  {
                    "label": "toggle zen mode",
                    "path": "workbench.action.toggleZenMode",
                    "type": "command"
                  }
                ],
                "collapsibleState": 1,
                "filePath": ""
              },
              {
                "label": "term general",
                "type": "folder",
                "expanded": false,
                "items": [
                  {
                    "label": "patch current dir",
                    "path": "git add . && git commit -m \\\"Cleaning w/ push\\\" && git push && pnpm version patch && git push && git push --tags",
                    "type": "powershellCommand",
                    "collapsibleState": 0,
                    "filePath": ""
                  },
                  {
                    "label": "commit and push current dir",
                    "path": "git add . && git commit -m \"Cleaning w/ push\" && git push",
                    "type": "powershellCommand",
                    "collapsibleState": 0,
                    "filePath": ""
                  }
                ],
                "collapsibleState": 1,
                "filePath": ""
              }
            ]
          }
        {
            "label": "FILES",
            "expanded": true,
            "items": [
                {
                    "label": "Admin Dashboard",
                    "path": "apps/app/app/routes/portal/$dept/settings/general.tsx",
                    "type": "file"
                },
                {
                    "label": "Client Dashboard",
                    "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx",
                    "type": "file"
                }
            ]
        },
        {
            "label": "RELATED",
            "expanded": false,
            "items": [
                {
                    "label": "client.website",
                    "path": "apps/app/app/routes/dealer/client/home.tsx",
                    "type": "file"
                }
            ]
        },
        {
            "label": "COMPONENTS",
            "expanded": false,
            "items": [
                {
                    "label": "app.sidebar",
                    "path": "apps/app/app/routes/__component/appSidebar.tsx",
                    "type": "file"
                }
            ]
        },
        {
            "label": "UTILS",
            "expanded": false,
            "items": [
                {
                    "label": "loader.server",
                    "path": "apps/app/app/utils/loader.server.tsx",
                    "type": "file"
                }
            ]
        },
        // copy snippet to clipboard when clicked
        {
            "label": "SNIPPETS",
            "expanded": false,
            "items": [
                {
                    "label": "loader.server",
                    "path": "apps/app/app/utils/loader.server.tsx"
                }
            ]
        },
        {
            "label": "WEB",
            "expanded": true,
            "items": [
                {
                    "label": "localhost/somewhere",
                    "path": "http://localhost:3000",
                    "type": "url"
                },
                {
                    "label": "Github",
                    "path": "https://www.github.com",
                    "type": "url"
                },
                {
                    "label": "Vercel Dashboard",
                    "path": "https://vercel.com/user",
                    "type": "url"
                }
            ]
        },
        {
            "label": "MD",
            "expanded": false,
            "items": [
                {
                    "label": "Admin Dashboard",
                    "path": "apps/app/app/routes/portal/$dept/settings/general.tsx",
                    "type": "file"
                },
                {
                    "label": "Client Dashboard",
                    "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx",
                    "type": "file"
                }
            ]
        },
        {
            "label": "TODO",
            "expanded": false,
            "items": [
                {
                    "label": "Admin Dashboard",
                    "path": "apps/app/app/routes/portal/$dept/settings/general.tsx",
                    "type": "file"
                },
                {
                    "label": "Client Dashboard",
                    "path": "apps/app/app/routes/client/portal/sales/dashboard.tsx",
                    "type": "file"
                }
            ]
        }
    ]
};