    /**
    * Project Configuration Backup System
    *  
    * This system handles saving and loading project-specific configurations to/from the .vscode folder
    * It ensures bookmarks, commands, and other project settings persist across sessions and can be
    * transferred between different machines working on the same project.
    */
    //#region
    // Configuration filename constants

    // wouldnt it be better save the config file like so, `${project roots folder name}_ocrmnavigator.config.json`
    const CONFIG_FILENAME = 'OpinionatedCRM_ocrmnavigator.config.json';
    const VSCODE_FOLDER = '.vscode';
    /**
     * Initialize the project configuration system
     * Should be called when the extension activates
     */
    async function initProjectConfigSystem(context) {
        // Get the workspace folder - for multi-root workspaces, we'll use the first one
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('No workspace folder found. Using global configuration only.');
            return;
        }

        const workspaceFolder = workspaceFolders[0].uri.fsPath;
        const vscodeFolder = path.join(workspaceFolder, VSCODE_FOLDER);
        const configFilePath = path.join(vscodeFolder, CONFIG_FILENAME);

        // Check if the current workspace has a saved configuration
        const hasProjectConfig = await checkIfProjectConfigExists(configFilePath);

        // Load current extension configuration
        const currentConfig = await loadCurrentExtensionConfig();

        // Generate a configuration identifier based on workspace attributes
        const workspaceConfigId = generateWorkspaceConfigId(workspaceFolder);

        if (hasProjectConfig) {
            // Load project config and compare with current config
            const projectConfig = await loadProjectConfig(configFilePath);

            // Check if the loaded config matches the current workspace
            if (projectConfig.workspaceId !== workspaceConfigId) {
                // If we're in a different workspace now, load the project-specific config
                await applyProjectConfig(projectConfig);
                vscode.window.showInformationMessage('Project-specific configuration loaded.');
            }
        } else {
            // First time in this project, create initial backup with project identifier
            const initialConfig = {
                ...currentConfig,
                workspaceId: workspaceConfigId,
                lastUpdated: new Date().toISOString(),
            };

            await saveProjectConfig(configFilePath, initialConfig);
            vscode.window.showInformationMessage('Initial project configuration saved.');
        }

        // Set up save on change listener for auto-backup
        registerConfigChangeListener(configFilePath);
    }
    /**
     * Generate a unique identifier for the workspace
     * This helps determine if we're in the same project even if on different machines
     */
    function generateWorkspaceConfigId(workspacePath) {
        // Extract just the project name from the path to make it machine-independent
        const projectName = path.basename(workspacePath);

        // Add any other unique but consistent project identifiers
        // (could use package.json name if it exists, git remote, etc.)
        return projectName;
    }
    /**
     * Check if project configuration exists in the .vscode folder
     */
    async function checkIfProjectConfigExists(configFilePath) {
        try {
            await fs.access(configFilePath);
            return true;
        } catch (error) {
            return false;
        }
    }
    /**
     * Load the current extension configuration from storage
     */
    async function loadCurrentExtensionConfig() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(null, function (config) {
                resolve(config || {});
            });
        });
    }
    /**
     * Load project configuration from the .vscode folder
     */
    async function loadProjectConfig(configFilePath) {
        try {
            const configData = await fs.readFile(configFilePath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('Error loading project config:', error);
            throw error;
        }
    }
    /**
     * Apply the project configuration to the extension
     */
    async function applyProjectConfig(projectConfig) {
        return new Promise((resolve, reject) => {
            // Extract items we need to apply to the current configuration
            const { PRIMARY, SECONDARY, COMPONENTS, UTILS, SNIPPETS, commands, urls, powershellCommands } = projectConfig;

            // Create empty configuration with proper structure
            const newConfig = {
                PRIMARY: [],
                SECONDARY: [],
                COMPONENTS: [],
                UTILS: [],
                SNIPPETS: projectConfig.SNIPPETS || [],
                commands: projectConfig.commands || {},
                urls: projectConfig.urls || {},
                powershellCommands: projectConfig.powershellCommands || {}
            };

            // Set the new configuration
            chrome.storage.sync.set(newConfig, function () {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }
    /**
     * Save the current extension configuration to the project's .vscode folder
     */
    async function saveProjectConfig(configFilePath, config) {
        try {
            // Ensure .vscode folder exists
            const vscodeFolder = path.dirname(configFilePath);
            await fs.mkdir(vscodeFolder, { recursive: true });

            // Save config file
            await fs.writeFile(
                configFilePath,
                JSON.stringify(config, null, 2),
                'utf8'
            );

            return true;
        } catch (error) {
            console.error('Error saving project config:', error);
            vscode.window.showErrorMessage(`Failed to save project configuration: ${error.message}`);
            return false;
        }
    }
    /**
     * Register a listener to save project configuration when extension settings change
     */
    function registerConfigChangeListener(configFilePath) {
        // Listen for changes to extension configuration
        chrome.storage.onChanged.addListener(async function (changes, namespace) {
            if (namespace === 'sync') {
                // Get the complete current configuration
                const currentConfig = await loadCurrentExtensionConfig();

                // Add/update the metadata
                currentConfig.lastUpdated = new Date().toISOString();

                // Save to project folder
                await saveProjectConfig(configFilePath, currentConfig);
            }
        });
    }
    /**
     * Adds a command to export/import project configuration
     */
    function registerConfigCommands(context) {
        // Register command to manually export configuration
        const exportCmd = vscode.commands.registerCommand('extension.exportProjectConfig', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            const workspaceFolder = workspaceFolders[0].uri.fsPath;
            const vscodeFolder = path.join(workspaceFolder, VSCODE_FOLDER);
            const configFilePath = path.join(vscodeFolder, CONFIG_FILENAME);

            const currentConfig = await loadCurrentExtensionConfig();
            currentConfig.workspaceId = generateWorkspaceConfigId(workspaceFolder);
            currentConfig.lastUpdated = new Date().toISOString();

            const success = await saveProjectConfig(configFilePath, currentConfig);
            if (success) {
                vscode.window.showInformationMessage('Project configuration exported successfully.');
            }
        });

        // Register command to manually import configuration
        const importCmd = vscode.commands.registerCommand('extension.importProjectConfig', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder found.');
                return;
            }

            const workspaceFolder = workspaceFolders[0].uri.fsPath;
            const vscodeFolder = path.join(workspaceFolder, VSCODE_FOLDER);
            const configFilePath = path.join(vscodeFolder, CONFIG_FILENAME);

            try {
                const projectConfig = await loadProjectConfig(configFilePath);
                await applyProjectConfig(projectConfig);
                vscode.window.showInformationMessage('Project configuration imported successfully.');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to import project configuration: ${error.message}`);
            }
        });

        context.subscriptions.push(exportCmd, importCmd);
    }
    /**
     * Integration with the snippets import feature
     * Call this after snippets are imported to update the project config
     */
    function updateProjectConfigAfterSnippetImport() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        const workspaceFolder = workspaceFolders[0].uri.fsPath;
        const vscodeFolder = path.join(workspaceFolder, VSCODE_FOLDER);
        const configFilePath = path.join(vscodeFolder, CONFIG_FILENAME);

        loadCurrentExtensionConfig().then(currentConfig => {
            currentConfig.lastUpdated = new Date().toISOString();
            saveProjectConfig(configFilePath, currentConfig);
        });
    }

    // Export the functions to use in other parts of the extension
    module.exports = {
        initProjectConfigSystem,
        registerConfigCommands,
        updateProjectConfigAfterSnippetImport
    };
    //#endregion