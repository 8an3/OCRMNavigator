export const config = {
    "categories": [
        {
            "label": "CMDS",
            "type": "folder",
            "expanded": true,
            "items": [
                {
                    "label": "VSCode Commands Reference",
                    "path": "command:ocrmnavigator.showCommandsReference",
                    "type": "command"
                },
                {
                    "label": "Formatting",
                    "type": "folder",
                    "items": [
                        {
                            "label": "Format Document",
                            "cmd": "editor.action.formatDocument",
                            "type": "command"
                        }
                    ]
                },
                {
                    "label": "Folding",
                    "type": "folder",
                    "items": [
                        {
                            "label": "Fold Level 1",
                            "cmd": "editor.foldLevel1",
                            "type": "command"
                        }
                    ]
                }
            ]
        },
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