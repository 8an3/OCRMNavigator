import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export async function getFormatterConfig() {
    try {
        // Ensure directory exists
        const configDir = path.dirname(formatterConfigPath);
        if (!fs.existsSync(configDir)) {            fs.mkdirSync(configDir, { recursive: true });        }
        
        // Create default config if it doesn't exist
        if (!fs.existsSync(formatterConfigPath)) {
            const defaultConfig = {
                formatters: {
                    json: {
                        enabled: true,
                        indentSize: 2,
                        useTabs: false,
                        removeTrailingCommas: true,
                        sortKeys: false
                    },
                    javascript: {
                        enabled: false,
                        indentSize: 4,
                        useTabs: false,
                        semiColons: true
                    },
                    html: {
                        enabled: false,
                        indentSize: 2,
                        useTabs: false
                    },
                    css: {
                        enabled: false,
                        indentSize: 2,
                        useTabs: false
                    }
                }
            };
            
            fs.writeFileSync(formatterConfigPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
            return defaultConfig;
        }
        
        // Read and parse existing config
        const content = fs.readFileSync(formatterConfigPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        vscode.window.showErrorMessage(`Error loading formatter config: ${error.message}`);
        return null;
    }
}
export  async function saveFormatterConfig(config) {
    try {
        // Ensure directory exists
        const configDir = path.dirname(formatterConfigPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        // Write config file
        fs.writeFileSync(formatterConfigPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        throw new Error(`Failed to save formatter config: ${error.message}`);
    }
}
export function formatContent(content, fileType, options) {
    switch (fileType) {
        case 'json':
            return formatJson(content, options);
        case 'javascript':
        case 'typescript':
            return formatJavascript(content, options);
        case 'html':
            return formatHtml(content, options);
        case 'css':
            return formatCss(content, options);
        default:
            throw new Error(`No formatter implementation for ${fileType} files.`);
    }
}
export function formatJson(content, options) {
    try {
        // Fix trailing commas if enabled
        if (options.removeTrailingCommas) {
            content = content.replace(/,(\s*})/g, '$1');
            content = content.replace(/,(\s*\])/g, '$1');
        }
        
        // Parse and stringify to format
        const obj = JSON.parse(content);
        
        // Sort keys if enabled
        if (options.sortKeys) {
            const sortedObj = sortObjectKeys(obj);
            return JSON.stringify(sortedObj, null, options.useTabs ? '\t' : options.indentSize);
        }
        
        return JSON.stringify(obj, null, options.useTabs ? '\t' : options.indentSize);
    } catch (error) {
        throw new Error(`JSON format error: ${error.message}`);
    }
}
export function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    
    const sortedObj = {};
    Object.keys(obj).sort().forEach(key => {
        sortedObj[key] = sortObjectKeys(obj[key]);
    });
    
    return sortedObj;
}
export function formatJavascript(content, options) {
    // Implement custom JavaScript formatting logic here
    // This is a simplified example - you might want to use a proper JS parser
    
    // Add or remove semicolons based on options
    if (options.semiColons) {
        // Ensure statements end with semicolons
        content = content.replace(/(\w+|\)|\}|\'|\"|\`)\s*(\n|\r\n)/g, '$1;\n');
    } else {
        // Remove unnecessary semicolons
        content = content.replace(/;(\s*)(\n|\r\n)/g, '$1\n');
    }
    
    // Implement other formatting options here
    
    return content;
}
export function formatHtml(content, options) {
    // Implement custom HTML formatting logic here
    return content; // Placeholder
}
export function formatCss(content, options) {
    // Implement custom CSS formatting logic here
    return content; // Placeholder
}


