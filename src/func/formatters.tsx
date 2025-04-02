import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';


export function fixTrailingCommas(jsonString) {
    // Fix object trailing commas - match a comma followed by optional whitespace and then a closing brace
    jsonString = jsonString.replace(/,(\s*})/g, '$1');

    // Fix array trailing commas - match a comma followed by optional whitespace and then a closing bracket
    jsonString = jsonString.replace(/,(\s*\])/g, '$1');

    return jsonString;
}
export async function getFormatterConfig(formatterConfigPath: any) {
    try {
        // Ensure directory exists
        const configDir = path.dirname(formatterConfigPath);
        if (!fs.existsSync(configDir)) { fs.mkdirSync(configDir, { recursive: true }); }

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
export async function saveFormatterConfig(config) {
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



//#region
export const fileFormatOptions = [
    {
        title: "TypeScript (.ts)",
        description: "TypeScript source file",
        inputType: ".ts"
    },
    {
        title: "TypeScript JSX (.tsx)",
        description: "TypeScript file with JSX syntax",
        inputType: ".tsx"
    },
    {
        title: "JavaScript (.js)",
        description: "JavaScript source file",
        inputType: ".js"
    },
    {
        title: "JavaScript JSX (.jsx)",
        description: "JavaScript file with JSX syntax",
        inputType: ".jsx"
    },
    {
        title: "Markdown (.md)",
        description: "Markdown documentation file",
        inputType: ".md"
    },
    {
        title: "JSON (.json)",
        description: "JavaScript Object Notation data file",
        inputType: ".json"
    },
    {
        title: "HTML (.html)",
        description: "HyperText Markup Language file",
        inputType: ".html"
    },
    {
        title: "CSS (.css)",
        description: "Cascading Style Sheets file",
        inputType: ".css"
    },
    {
        title: "SCSS (.scss)",
        description: "Sassy CSS file",
        inputType: ".scss"
    },
    {
        title: "LESS (.less)",
        description: "Leaner CSS file",
        inputType: ".less"
    },
    {
        title: "SVG (.svg)",
        description: "Scalable Vector Graphics file",
        inputType: ".svg"
    },
    {
        title: "Image (.png)",
        description: "Portable Network Graphics image",
        inputType: ".png"
    },
    {
        title: "Image (.jpg)",
        description: "JPEG image file",
        inputType: ".jpg"
    },
    {
        title: "Image (.gif)",
        description: "Graphics Interchange Format file",
        inputType: ".gif"
    },
    {
        title: "Image (.webp)",
        description: "WebP image format",
        inputType: ".webp"
    },
    {
        title: "Font (.woff)",
        description: "Web Open Font Format",
        inputType: ".woff"
    },
    {
        title: "Font (.woff2)",
        description: "Web Open Font Format 2",
        inputType: ".woff2"
    },
    {
        title: "Video (.mp4)",
        description: "MPEG-4 video file",
        inputType: ".mp4"
    },
    {
        title: "Video (.webm)",
        description: "WebM video format",
        inputType: ".webm"
    },
    {
        title: "Audio (.mp3)",
        description: "MPEG Audio Layer III file",
        inputType: ".mp3"
    },
    {
        title: "PDF (.pdf)",
        description: "Portable Document Format",
        inputType: ".pdf"
    },
    {
        title: "Text (.txt)",
        description: "Plain text file",
        inputType: ".txt"
    },
    {
        title: "CSV (.csv)",
        description: "Comma-separated values file",
        inputType: ".csv"
    },
    {
        title: "YAML (.yaml)",
        description: "YAML configuration file",
        inputType: ".yaml"
    },
    {
        title: "XML (.xml)",
        description: "Extensible Markup Language file",
        inputType: ".xml"
    },
    {
        title: "GraphQL (.graphql)",
        description: "GraphQL schema file",
        inputType: ".graphql"
    },
    {
        title: "Shell Script (.sh)",
        description: "Bash shell script",
        inputType: ".sh"
    },
    {
        title: "Dockerfile",
        description: "Docker container configuration",
        inputType: "Dockerfile"
    },
    {
        title: "Git Ignore (.gitignore)",
        description: "Git ignore rules file",
        inputType: ".gitignore"
    },
    {
        title: "Env File (.env)",
        description: "Environment configuration file",
        inputType: ".env"
    }
];
export const tsxFormatOptions = [
    // Indentation
    {
        id: "indentSize",
        title: "Indent Size",
        description: "Number of spaces per indentation level",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "tabWidth",
        title: "Tab Width",
        description: "Number of spaces a tab represents",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "useTabs",
        title: "Use Tabs",
        description: "Use tabs instead of spaces for indentation",
        type: "boolean",
        default: false,
        category: "Indentation"
    },

    // Line Length
    {
        id: "printWidth",
        title: "Line Length",
        description: "Maximum line length before wrapping",
        type: "number",
        default: 80,
        min: 40,
        max: 200,
        category: "Line Length"
    },

    // Quotes
    {
        id: "singleQuote",
        title: "Single Quotes",
        description: "Use single quotes instead of double quotes",
        type: "boolean",
        default: false,
        category: "Quotes"
    },
    {
        id: "jsxSingleQuote",
        title: "JSX Single Quotes",
        description: "Use single quotes in JSX",
        type: "boolean",
        default: false,
        category: "Quotes"
    },

    // Semicolons
    {
        id: "semi",
        title: "Semicolons",
        description: "Print semicolons at ends of statements",
        type: "boolean",
        default: true,
        category: "Semicolons"
    },

    // JSX
    {
        id: "jsxBracketSameLine",
        title: "JSX Brackets Same Line",
        description: "Put > on the last line of multi-line JSX elements",
        type: "boolean",
        default: false,
        category: "JSX"
    },
    {
        id: "jsxClosingTagLocation",
        title: "JSX Closing Tag Location",
        description: "Where to place closing JSX tags",
        type: "select",
        options: [
            { value: "tag-aligned", label: "Tag Aligned" },
            { value: "line-aligned", label: "Line Aligned" },
            { value: "after-props", label: "After Props" }
        ],
        default: "tag-aligned",
        category: "JSX"
    },

    // Objects
    {
        id: "bracketSpacing",
        title: "Bracket Spacing",
        description: "Print spaces between brackets in object literals",
        type: "boolean",
        default: true,
        category: "Objects"
    },
    {
        id: "objectCurlySpacing",
        title: "Object Curly Spacing",
        description: "Include spaces inside object curly braces",
        type: "boolean",
        default: true,
        category: "Objects"
    },

    // Arrays
    {
        id: "arrayBracketSpacing",
        title: "Array Bracket Spacing",
        description: "Include spaces inside array brackets",
        type: "boolean",
        default: true,
        category: "Arrays"
    },
    {
        id: "arrayBracketNewline",
        title: "Array Bracket Newline",
        description: "Break array brackets onto new lines",
        type: "boolean",
        default: false,
        category: "Arrays"
    },

    // Functions
    {
        id: "arrowParens",
        title: "Arrow Function Parentheses",
        description: "Include parentheses around arrow function parameters",
        type: "select",
        options: [
            { value: "always", label: "Always" },
            { value: "avoid", label: "Avoid when possible" }
        ],
        default: "always",
        category: "Functions"
    },
    {
        id: "functionParentheses",
        title: "Function Parentheses",
        description: "Control function parentheses in JSX/TSX",
        type: "select",
        options: [
            { value: "always", label: "Always include" },
            { value: "ignore", label: "Ignore" }
        ],
        default: "always",
        category: "Functions"
    },

    // Imports
    {
        id: "importOrder",
        title: "Import Order",
        description: "Sort order for import statements",
        type: "select",
        options: [
            { value: "none", label: "No sorting" },
            { value: "alphabetical", label: "Alphabetical" },
            { value: "react-first", label: "React imports first" },
            { value: "type-first", label: "Type imports first" }
        ],
        default: "none",
        category: "Imports"
    },
    {
        id: "importOrderSeparation",
        title: "Import Separation",
        description: "Add new line between import groups",
        type: "boolean",
        default: true,
        category: "Imports"
    },

    // Type Annotations
    {
        id: "typeAnnotationSpacing",
        title: "Type Annotation Spacing",
        description: "Include spaces around type annotations",
        type: "boolean",
        default: true,
        category: "Type Annotations"
    },
    {
        id: "typeLiteralSeparator",
        title: "Type Literal Separator",
        description: "Trailing comma in type literals",
        type: "select",
        options: [
            { value: "always", label: "Always" },
            { value: "never", label: "Never" },
            { value: "multi-line", label: "Multi-line only" }
        ],
        default: "multi-line",
        category: "Type Annotations"
    },

    // Advanced
    {
        id: "endOfLine",
        title: "Line Endings",
        description: "Line ending style",
        type: "select",
        options: [
            { value: "lf", label: "LF (Unix)" },
            { value: "crlf", label: "CRLF (Windows)" },
            { value: "auto", label: "Auto-detect" }
        ],
        default: "lf",
        category: "Advanced"
    },
    {
        id: "proseWrap",
        title: "Markdown Wrapping",
        description: "How to wrap prose in Markdown",
        type: "select",
        options: [
            { value: "always", label: "Always wrap" },
            { value: "never", label: "Never wrap" },
            { value: "preserve", label: "Preserve original" }
        ],
        default: "preserve",
        category: "Advanced"
    }
];
export const jsonFormatOptions = [
    {
        id: "jsonIndentSize",
        title: "Indentation Size",
        description: "Number of spaces for JSON indentation",
        type: "number",
        default: 2,
        min: 0,
        max: 8,
        category: "Indentation"
    },
    {
        id: "jsonInlineObjects",
        title: "Inline Simple Objects",
        description: "Keep single-property objects on one line",
        type: "boolean",
        default: false,
        category: "Objects"
    },
    {
        id: "jsonBracketSpacing",
        title: "Bracket Spacing",
        description: "Add spaces inside curly braces { }",
        type: "boolean",
        default: true,
        category: "Objects"
    },
    {
        id: "jsonArrayBracketSpacing",
        title: "Array Bracket Spacing",
        description: "Add spaces inside array brackets [ ]",
        type: "boolean",
        default: true,
        category: "Arrays"
    },
    {
        id: "jsonQuoteKeys",
        title: "Quote Keys",
        description: "Always use quotes around object keys",
        type: "boolean",
        default: true,
        category: "Quotes"
    },
    {
        id: "jsonTrailingCommas",
        title: "Trailing Commas",
        description: "Add trailing commas in objects/arrays",
        type: "select",
        options: [
            { value: "none", label: "Never" },
            { value: "es5", label: "ES5-compatible (objects/arrays)" },
            { value: "all", label: "Always" }
        ],
        default: "none",
        category: "Punctuation"
    },
    {
        id: "jsonSortKeys",
        title: "Sort Object Keys",
        description: "Alphabetically sort object keys",
        type: "boolean",
        default: false,
        category: "Objects"
    },
    {
        id: "jsonPreserveEmptyLines",
        title: "Preserve Empty Lines",
        description: "Keep empty lines in the original JSON",
        type: "boolean",
        default: true,
        category: "Whitespace"
    },
    {
        id: "jsonMaxInlineComplexity",
        title: "Max Inline Complexity",
        description: "How many nested structures can appear inline before forcing newlines",
        type: "number",
        default: 2,
        min: 0,
        max: 10,
        category: "Objects"
    },
    {
        id: "jsonLineLength",
        title: "Max Line Length",
        description: "Wrap JSON lines exceeding this length (0 to disable)",
        type: "number",
        default: 80,
        min: 0,
        max: 500,
        category: "Line Wrapping"
    },
    {
        id: "jsonArrayFormatting",
        title: "Array Formatting",
        description: "Control how arrays are formatted",
        type: "select",
        options: [
            { value: "consistent", label: "Consistent (match parent)" },
            { value: "inline", label: "Force inline when possible" },
            { value: "multiline", label: "Force multiline" }
        ],
        default: "consistent",
        category: "Arrays"
    },
    {
        id: "jsonObjectFormatting",
        title: "Object Formatting",
        description: "Control how objects are formatted",
        type: "select",
        options: [
            { value: "consistent", label: "Consistent (match parent)" },
            { value: "inline", label: "Force inline when possible" },
            { value: "multiline", label: "Force multiline" }
        ],
        default: "consistent",
        category: "Objects"
    },
    {
        id: "jsonQuoteStyle",
        title: "Quote Style",
        description: "Preferred quote type for strings",
        type: "select",
        options: [
            { value: "double", label: "Double quotes (\")" },
            { value: "single", label: "Single quotes (')" }
        ],
        default: "double",
        category: "Quotes"
    },
    {
        id: "jsonComments",
        title: "Allow Comments",
        description: "Preserve JavaScript-style comments (//, /* */)",
        type: "boolean",
        default: false,
        category: "Special"
    },
    {
        id: "jsonMergeDuplicateKeys",
        title: "Merge Duplicate Keys",
        description: "Combine duplicate keys in objects (last one wins)",
        type: "boolean",
        default: false,
        category: "Special"
    }
];
export const htmlFormatOptions = [
    // Indentation
    {
        id: "htmlIndentSize",
        title: "Indent Size",
        description: "Number of spaces per indentation level",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "htmlUseTabs",
        title: "Use Tabs",
        description: "Use tabs instead of spaces for indentation",
        type: "boolean",
        default: false,
        category: "Indentation"
    },

    // Line Wrapping
    {
        id: "htmlPrintWidth",
        title: "Line Length",
        description: "Maximum line length before wrapping (0 to disable)",
        type: "number",
        default: 80,
        min: 0,
        max: 500,
        category: "Line Wrapping"
    },
    {
        id: "htmlWrapLineLength",
        title: "Wrap Line Length",
        description: "Soft wrap at specified column (0 to disable)",
        type: "number",
        default: 0,
        min: 0,
        max: 500,
        category: "Line Wrapping"
    },

    // Tags
    {
        id: "htmlSelfClosingStyle",
        title: "Self-Closing Tags",
        description: "Format for void/self-closing tags",
        type: "select",
        options: [
            { value: "xhtml", label: "XHTML (<br/>)" },
            { value: "html", label: "HTML5 (<br>)" },
            { value: "auto", label: "Match document type" }
        ],
        default: "html",
        category: "Tags"
    },
    {
        id: "htmlCloseTagSameLine",
        title: "Closing Tag Same Line",
        description: "Keep closing tag on same line for inline elements",
        type: "boolean",
        default: true,
        category: "Tags"
    },
    {
        id: "htmlWrapAttributes",
        title: "Wrap Attributes",
        description: "How to handle long attribute lists",
        type: "select",
        options: [
            { value: "auto", label: "Auto-wrap" },
            { value: "force", label: "Always wrap" },
            { value: "force-aligned", label: "Align wrapped" },
            { value: "force-expand-multiline", label: "Expand multiline" },
            { value: "preserve", label: "Preserve original" }
        ],
        default: "auto",
        category: "Tags"
    },

    // Attributes
    {
        id: "htmlAttributeQuotes",
        title: "Attribute Quotes",
        description: "Quote style for attributes",
        type: "select",
        options: [
            { value: "double", label: "Double quotes (\")" },
            { value: "single", label: "Single quotes (')" },
            { value: "none", label: "No quotes (careful!)" }
        ],
        default: "double",
        category: "Attributes"
    },
    {
        id: "htmlSortAttributes",
        title: "Sort Attributes",
        description: "Sort order for attributes",
        type: "select",
        options: [
            { value: "none", label: "None" },
            { value: "alphabetical", label: "Alphabetical" },
            { value: "code-guide", label: "Code Guide (id, class, etc.)" },
            { value: "vuejs", label: "Vue.js convention" },
            { value: "custom", label: "Custom order" }
        ],
        default: "none",
        category: "Attributes"
    },
    {
        id: "htmlSortAttributesList",
        title: "Custom Attribute Order",
        description: "Comma-separated priority attributes (when using custom sort)",
        type: "string",
        default: "id,class,name,data-*,src,for,type,href,value,ng-*,*",
        category: "Attributes"
    },

    // Whitespace
    {
        id: "htmlPreserveNewlines",
        title: "Preserve Newlines",
        description: "Keep original line breaks",
        type: "boolean",
        default: true,
        category: "Whitespace"
    },
    {
        id: "htmlExtraLiners",
        title: "Extra Liners",
        description: "Tags that should have extra newlines around them",
        type: "string",
        default: "head,body,/html",
        category: "Whitespace"
    },

    // Embedded Content
    {
        id: "htmlFormatEmbedded",
        title: "Format Embedded",
        description: "Format embedded scripts/styles",
        type: "select",
        options: [
            { value: "auto", label: "Auto-detect" },
            { value: "always", label: "Always" },
            { value: "never", label: "Never" }
        ],
        default: "auto",
        category: "Embedded"
    },
    {
        id: "htmlIndentScripts",
        title: "Indent Scripts/Styles",
        description: "Indent content inside <script> and <style> tags",
        type: "select",
        options: [
            { value: "keep", label: "Keep existing" },
            { value: "separate", label: "Indent content" },
            { value: "flat", label: "No indentation" }
        ],
        default: "keep",
        category: "Embedded"
    },

    // Special Cases
    {
        id: "htmlIgnoreComments",
        title: "Ignore Comments",
        description: "Don't reformat HTML comments",
        type: "boolean",
        default: false,
        category: "Special"
    },
    {
        id: "htmlIgnoreCDATA",
        title: "Ignore CDATA",
        description: "Don't reformat CDATA sections",
        type: "boolean",
        default: false,
        category: "Special"
    },
    {
        id: "htmlUnformatted",
        title: "Unformatted Tags",
        description: "Comma-separated list of tags to leave as-is",
        type: "string",
        default: "pre,code,textarea",
        category: "Special"
    },
    {
        id: "htmlEndWithNewline",
        title: "End With Newline",
        description: "Add final newline at EOF",
        type: "boolean",
        default: true,
        category: "Special"
    }
];
export const scssFormatOptions = [
    // Indentation
    {
        id: "indentSize",
        title: "Indent Size",
        description: "Number of spaces per indentation level",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "useTabs",
        title: "Use Tabs",
        description: "Use tabs instead of spaces for indentation",
        type: "boolean",
        default: false,
        category: "Indentation"
    },

    // Line Length
    {
        id: "maxLineLength",
        title: "Max Line Length",
        description: "Maximum line length before wrapping",
        type: "number",
        default: 80,
        min: 40,
        max: 200,
        category: "Line Length"
    },

    // Braces
    {
        id: "bracketSpacing",
        title: "Bracket Spacing",
        description: "Print spaces between brackets in rules",
        type: "boolean",
        default: true,
        category: "Braces"
    },

    // Semicolons
    {
        id: "semi",
        title: "Semicolons",
        description: "Print semicolons at ends of statements",
        type: "boolean",
        default: true,
        category: "Semicolons"
    },

    // Quotes
    {
        id: "quoteStyle",
        title: "String Quote Style",
        description: "Use single or double quotes for strings",
        type: "select",
        options: [
            { value: "double", label: "Double Quotes" },
            { value: "single", label: "Single Quotes" }
        ],
        default: "double",
        category: "Quotes"
    },

    // Nesting
    {
        id: "maxNestDepth",
        title: "Max Nesting Depth",
        description: "Maximum allowed nesting depth for selectors",
        type: "number",
        default: 3,
        min: 1,
        max: 10,
        category: "Nesting"
    },

    // Property Sorting
    {
        id: "sortProperties",
        title: "Sort Properties Alphabetically",
        description: "Sort CSS properties alphabetically",
        type: "boolean",
        default: false,
        category: "Sorting"
    },

    // Whitespace
    {
        id: "removeExtraLines",
        title: "Remove Extra Lines",
        description: "Remove unnecessary empty lines",
        type: "boolean",
        default: false,
        category: "Whitespace"
    },
    {
        id: "collapseWhitespace",
        title: "Collapse Whitespace",
        description: "Remove unnecessary spaces",
        type: "boolean",
        default: true,
        category: "Whitespace"
    },

    // End of File
    {
        id: "endOfLine",
        title: "Line Endings",
        description: "Line ending style",
        type: "select",
        options: [
            { value: "lf", label: "LF (Unix)" },
            { value: "crlf", label: "CRLF (Windows)" },
            { value: "auto", label: "Auto-detect" }
        ],
        default: "lf",
        category: "Advanced"
    }
];
export const htmlFormatOptions = [
    // Indentation
    {
        id: "indentSize",
        title: "Indent Size",
        description: "Number of spaces per indentation level",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "useTabs",
        title: "Use Tabs",
        description: "Use tabs instead of spaces for indentation",
        type: "boolean",
        default: false,
        category: "Indentation"
    },

    // Line Length
    {
        id: "wrapLineLength",
        title: "Wrap Line Length",
        description: "Maximum line length before wrapping",
        type: "number",
        default: 80,
        min: 40,
        max: 200,
        category: "Line Length"
    },

    // Quotes
    {
        id: "quoteStyle",
        title: "Attribute Quote Style",
        description: "Use single or double quotes for attributes",
        type: "select",
        options: [
            { value: "double", label: "Double Quotes" },
            { value: "single", label: "Single Quotes" }
        ],
        default: "double",
        category: "Quotes"
    },

    // Self-closing Tags
    {
        id: "selfClosingTags",
        title: "Self-Closing Tags",
        description: "Use self-closing syntax for void elements",
        type: "boolean",
        default: true,
        category: "Tags"
    },

    // Attribute Formatting
    {
        id: "sortAttributes",
        title: "Sort Attributes Alphabetically",
        description: "Sort HTML attributes alphabetically",
        type: "boolean",
        default: false,
        category: "Attributes"
    },
    {
        id: "preserveAttributeLineBreaks",
        title: "Preserve Attribute Line Breaks",
        description: "Keep attributes on separate lines if formatted that way",
        type: "boolean",
        default: true,
        category: "Attributes"
    },

    // Whitespace
    {
        id: "collapseWhitespace",
        title: "Collapse Whitespace",
        description: "Remove unnecessary whitespace",
        type: "boolean",
        default: true,
        category: "Whitespace"
    },
    {
        id: "removeEmptyLines",
        title: "Remove Empty Lines",
        description: "Eliminate unnecessary empty lines",
        type: "boolean",
        default: false,
        category: "Whitespace"
    },

    // End of File
    {
        id: "endOfLine",
        title: "Line Endings",
        description: "Line ending style",
        type: "select",
        options: [
            { value: "lf", label: "LF (Unix)" },
            { value: "crlf", label: "CRLF (Windows)" },
            { value: "auto", label: "Auto-detect" }
        ],
        default: "lf",
        category: "Advanced"
    }
];
export const scssFormatOptions = [
    // Indentation
    {
        id: "indentSize",
        title: "Indent Size",
        description: "Number of spaces per indentation level",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "useTabs",
        title: "Use Tabs",
        description: "Use tabs instead of spaces for indentation",
        type: "boolean",
        default: false,
        category: "Indentation"
    },

    // Line Length
    {
        id: "maxLineLength",
        title: "Max Line Length",
        description: "Maximum line length before wrapping",
        type: "number",
        default: 80,
        min: 40,
        max: 200,
        category: "Line Length"
    },

    // Braces
    {
        id: "bracketSpacing",
        title: "Bracket Spacing",
        description: "Print spaces between brackets in rules",
        type: "boolean",
        default: true,
        category: "Braces"
    },

    // Semicolons
    {
        id: "semi",
        title: "Semicolons",
        description: "Print semicolons at ends of statements",
        type: "boolean",
        default: true,
        category: "Semicolons"
    },

    // Quotes
    {
        id: "quoteStyle",
        title: "String Quote Style",
        description: "Use single or double quotes for strings",
        type: "select",
        options: [
            { value: "double", label: "Double Quotes" },
            { value: "single", label: "Single Quotes" }
        ],
        default: "double",
        category: "Quotes"
    },

    // Nesting
    {
        id: "maxNestDepth",
        title: "Max Nesting Depth",
        description: "Maximum allowed nesting depth for selectors",
        type: "number",
        default: 3,
        min: 1,
        max: 10,
        category: "Nesting"
    },

    // Property Sorting
    {
        id: "sortProperties",
        title: "Sort Properties Alphabetically",
        description: "Sort CSS properties alphabetically",
        type: "boolean",
        default: false,
        category: "Sorting"
    },

    // Whitespace
    {
        id: "removeExtraLines",
        title: "Remove Extra Lines",
        description: "Remove unnecessary empty lines",
        type: "boolean",
        default: false,
        category: "Whitespace"
    },
    {
        id: "collapseWhitespace",
        title: "Collapse Whitespace",
        description: "Remove unnecessary spaces",
        type: "boolean",
        default: true,
        category: "Whitespace"
    },

    // End of File
    {
        id: "endOfLine",
        title: "Line Endings",
        description: "Line ending style",
        type: "select",
        options: [
            { value: "lf", label: "LF (Unix)" },
            { value: "crlf", label: "CRLF (Windows)" },
            { value: "auto", label: "Auto-detect" }
        ],
        default: "lf",
        category: "Advanced"
    }
];
export const svgFormatOptions = [
    // Indentation
    {
        id: "indentSize",
        title: "Indent Size",
        description: "Number of spaces per indentation level",
        type: "number",
        default: 2,
        min: 1,
        max: 8,
        category: "Indentation"
    },
    {
        id: "useTabs",
        title: "Use Tabs",
        description: "Use tabs instead of spaces for indentation",
        type: "boolean",
        default: false,
        category: "Indentation"
    },

    // Attributes Formatting
    {
        id: "sortAttributes",
        title: "Sort Attributes",
        description: "Sort SVG attributes alphabetically",
        type: "boolean",
        default: true,
        category: "Attributes"
    },
    {
        id: "quoteStyle",
        title: "Attribute Quote Style",
        description: "Use single or double quotes for attributes",
        type: "select",
        options: [
            { value: "double", label: "Double Quotes" },
            { value: "single", label: "Single Quotes" }
        ],
        default: "double",
        category: "Attributes"
    },

    // Whitespace
    {
        id: "removeExtraLines",
        title: "Remove Extra Lines",
        description: "Remove unnecessary empty lines",
        type: "boolean",
        default: false,
        category: "Whitespace"
    },
    {
        id: "collapseWhitespace",
        title: "Collapse Whitespace",
        description: "Remove unnecessary spaces",
        type: "boolean",
        default: true,
        category: "Whitespace"
    },

    // Minification
    {
        id: "removeComments",
        title: "Remove Comments",
        description: "Strip out XML comments from SVG",
        type: "boolean",
        default: true,
        category: "Minification"
    },
    {
        id: "removeMetadata",
        title: "Remove Metadata",
        description: "Strip out metadata tags from SVG",
        type: "boolean",
        default: true,
        category: "Minification"
    },
    {
        id: "collapseGroups",
        title: "Collapse Groups",
        description: "Merge nested groups where possible",
        type: "boolean",
        default: true,
        category: "Optimization"
    },
    {
        id: "convertColors",
        title: "Convert Colors",
        description: "Convert color values to shorter hex codes where possible",
        type: "boolean",
        default: true,
        category: "Optimization"
    },

    // End of File
    {
        id: "endOfLine",
        title: "Line Endings",
        description: "Line ending style",
        type: "select",
        options: [
            { value: "lf", label: "LF (Unix)" },
            { value: "crlf", label: "CRLF (Windows)" },
            { value: "auto", label: "Auto-detect" }
        ],
        default: "lf",
        category: "Advanced"
    }
];
export const pngFormatOptions = [
    // Compression
    {
        id: "compressionLevel",
        title: "Compression Level",
        description: "Level of PNG compression (0-9)",
        type: "number",
        default: 6,
        min: 0,
        max: 9,
        category: "Compression"
    },

    // Color Depth
    {
        id: "colorDepth",
        title: "Color Depth",
        description: "Bits per channel (8, 16)",
        type: "select",
        options: [
            { value: 8, label: "8-bit" },
            { value: 16, label: "16-bit" }
        ],
        default: 8,
        category: "Color"
    },

    // Transparency
    {
        id: "preserveTransparency",
        title: "Preserve Transparency",
        description: "Maintain alpha channel transparency",
        type: "boolean",
        default: true,
        category: "Transparency"
    },

    // Metadata
    {
        id: "stripMetadata",
        title: "Strip Metadata",
        description: "Remove metadata to reduce file size",
        type: "boolean",
        default: true,
        category: "Metadata"
    },

    // Optimization
    {
        id: "interlaced",
        title: "Interlaced",
        description: "Enable interlacing for progressive loading",
        type: "boolean",
        default: false,
        category: "Optimization"
    }
];
export const gifFormatOptions = [
    // Compression
    {
        id: "compressionLevel",
        title: "Compression Level",
        description: "Level of GIF compression (0-100)",
        type: "number",
        default: 80,
        min: 0,
        max: 100,
        category: "Compression"
    },

    // Color Reduction
    {
        id: "colorReduction",
        title: "Color Reduction",
        description: "Reduce colors to optimize file size",
        type: "boolean",
        default: true,
        category: "Color"
    },

    // Transparency
    {
        id: "preserveTransparency",
        title: "Preserve Transparency",
        description: "Maintain alpha channel transparency",
        type: "boolean",
        default: true,
        category: "Transparency"
    },

    // Metadata
    {
        id: "stripMetadata",
        title: "Strip Metadata",
        description: "Remove metadata to reduce file size",
        type: "boolean",
        default: true,
        category: "Metadata"
    },

    // Animation
    {
        id: "loopCount",
        title: "Loop Count",
        description: "Number of times the animation loops (0 for infinite)",
        type: "number",
        default: 0,
        min: 0,
        max: 100,
        category: "Animation"
    },
    {
        id: "frameDelay",
        title: "Frame Delay",
        description: "Delay in milliseconds between frames",
        type: "number",
        default: 100,
        min: 10,
        max: 1000,
        category: "Animation"
    }
];
export const woffFormatOptions = [
    // Compression
    {
        id: "compressionLevel",
        title: "Compression Level",
        description: "Level of WOFF compression (0-100)",
        type: "number",
        default: 80,
        min: 0,
        max: 100,
        category: "Compression"
    },

    // Font Embedding
    {
        id: "embedFonts",
        title: "Embed Fonts",
        description: "Embed fonts into the WOFF file",
        type: "boolean",
        default: true,
        category: "Font Embedding"
    },

    // Metadata
    {
        id: "stripMetadata",
        title: "Strip Metadata",
        description: "Remove metadata to reduce file size",
        type: "boolean",
        default: true,
        category: "Metadata"
    },

    // Font Subsetting
    {
        id: "fontSubset",
        title: "Font Subsetting",
        description: "Create a subset of the font (only include used characters)",
        type: "boolean",
        default: true,
        category: "Font Subsetting"
    },

    // Font Format
    {
        id: "fontFormat",
        title: "Font Format",
        description: "Choose the font format (WOFF or WOFF2)",
        type: "select",
        options: [
            { value: "woff", label: "WOFF" },
            { value: "woff2", label: "WOFF2" }
        ],
        default: "woff",
        category: "Font Format"
    }
];
export const webmFormatOptions = [
    // Compression
    {
        id: "compressionLevel",
        title: "Compression Level",
        description: "Level of WEBM compression (0-100)",
        type: "number",
        default: 80,
        min: 0,
        max: 100,
        category: "Compression"
    },

    // Resolution
    {
        id: "resolution",
        title: "Resolution",
        description: "Resolution of the video (e.g., 720p, 1080p)",
        type: "select",
        options: [
            { value: "720p", label: "720p" },
            { value: "1080p", label: "1080p" },
            { value: "1440p", label: "1440p" },
            { value: "2160p", label: "2160p" }
        ],
        default: "1080p",
        category: "Resolution"
    },

    // Frame Rate
    {
        id: "frameRate",
        title: "Frame Rate",
        description: "Frame rate of the video (e.g., 30fps, 60fps)",
        type: "select",
        options: [
            { value: 30, label: "30fps" },
            { value: 60, label: "60fps" }
        ],
        default: 30,
        category: "Frame Rate"
    },

    // Audio
    {
        id: "audio",
        title: "Audio",
        description: "Include audio in the video",
        type: "boolean",
        default: true,
        category: "Audio"
    },

    // Bitrate
    {
        id: "bitrate",
        title: "Bitrate",
        description: "Video bitrate for better quality (higher is better)",
        type: "number",
        default: 5000,
        min: 1000,
        max: 10000,
        category: "Bitrate"
    },

    // Metadata
    {
        id: "stripMetadata",
        title: "Strip Metadata",
        description: "Remove metadata to reduce file size",
        type: "boolean",
        default: true,
        category: "Metadata"
    }
];
export const txtFormatOptions = [
    // Encoding
    {
        id: "encoding",
        title: "Encoding",
        description: "Character encoding for the text file",
        type: "select",
        options: [
            { value: "utf-8", label: "UTF-8" },
            { value: "ascii", label: "ASCII" },
            { value: "iso-8859-1", label: "ISO-8859-1" }
        ],
        default: "utf-8",
        category: "Encoding"
    },

    // Line Breaks
    {
        id: "lineBreaks",
        title: "Line Breaks",
        description: "Line break style (CRLF or LF)",
        type: "select",
        options: [
            { value: "lf", label: "LF (Unix)" },
            { value: "crlf", label: "CRLF (Windows)" }
        ],
        default: "lf",
        category: "Line Breaks"
    },

    // Word Wrap
    {
        id: "wordWrap",
        title: "Word Wrap",
        description: "Enable word wrapping in the text file",
        type: "boolean",
        default: true,
        category: "Word Wrap"
    },

    // File Size
    {
        id: "maxFileSize",
        title: "Maximum File Size",
        description: "Maximum size of the text file (in KB)",
        type: "number",
        default: 1024,
        min: 1,
        max: 10000,
        category: "File Size"
    },

    // Metadata
    {
        id: "stripMetadata",
        title: "Strip Metadata",
        description: "Remove any hidden metadata to reduce file size",
        type: "boolean",
        default: true,
        category: "Metadata"
    }
];
export const csvFormatOptions = [
    // Delimiter
    {
      id: "delimiter",
      title: "Delimiter",
      description: "Character used to separate values",
      type: "select",
      options: [
        { value: ",", label: "Comma (,)" },
        { value: ";", label: "Semicolon (;)" },
        { value: "\t", label: "Tab" }
      ],
      default: ",",
      category: "Delimiter"
    },

    // Quote Character
    {
      id: "quoteChar",
      title: "Quote Character",
      description: "Character used to quote string values",
      type: "select",
      options: [
        { value: "\"", label: "Double Quote (\")" },
        { value: "'", label: "Single Quote ('')" }
      ],
      default: "\"",
      category: "Quote Character"
    },

    // Line Breaks
    {
      id: "lineBreaks",
      title: "Line Breaks",
      description: "Line break style (CRLF or LF)",
      type: "select",
      options: [
        { value: "lf", label: "LF (Unix)" },
        { value: "crlf", label: "CRLF (Windows)" }
      ],
      default: "lf",
      category: "Line Breaks"
    },

    // Header
    {
      id: "includeHeader",
      title: "Include Header",
      description: "Include the header row in the CSV file",
      type: "boolean",
      default: true,
      category: "Header"
    },

    // Encoding
    {
      id: "encoding",
      title: "Encoding",
      description: "Character encoding for the CSV file",
      type: "select",
      options: [
        { value: "utf-8", label: "UTF-8" },
        { value: "iso-8859-1", label: "ISO-8859-1" },
        { value: "ascii", label: "ASCII" }
      ],
      default: "utf-8",
      category: "Encoding"
    },

    // Quote All Fields
    {
      id: "quoteAllFields",
      title: "Quote All Fields",
      description: "Whether to quote all fields, including those without special characters",
      type: "boolean",
      default: false,
      category: "Quote Fields"
    },

    // Escape Special Characters
    {
      id: "escapeSpecialChars",
      title: "Escape Special Characters",
      description: "Escape special characters like commas or newlines within fields",
      type: "boolean",
      default: true,
      category: "Escaping"
    }
];
export const shFormatOptions = [
    // Line Endings
    {
      id: "lineEndings",
      title: "Line Endings",
      description: "Line ending style",
      type: "select",
      options: [
        { value: "lf", label: "LF (Unix)" },
        { value: "crlf", label: "CRLF (Windows)" },
        { value: "auto", label: "Auto-detect" }
      ],
      default: "lf",
      category: "Line Endings"
    },

    // Shebang
    {
      id: "shebang",
      title: "Shebang",
      description: "The shebang line to indicate script interpreter",
      type: "select",
      options: [
        { value: "#!/bin/bash", label: "#!/bin/bash" },
        { value: "#!/bin/sh", label: "#!/bin/sh" },
        { value: "#!/usr/bin/env bash", label: "#!/usr/bin/env bash" },
        { value: "#!/usr/bin/env sh", label: "#!/usr/bin/env sh" }
      ],
      default: "#!/bin/bash",
      category: "Shebang"
    },

    // Permissions
    {
      id: "executablePermission",
      title: "Executable Permission",
      description: "Make the script executable",
      type: "boolean",
      default: true,
      category: "Permissions"
    },

    // Indentation
    {
      id: "indentSize",
      title: "Indent Size",
      description: "Number of spaces per indentation level",
      type: "number",
      default: 2,
      min: 1,
      max: 8,
      category: "Indentation"
    },

    // Variable Naming
    {
      id: "variableNaming",
      title: "Variable Naming Convention",
      description: "Style for naming variables in the script",
      type: "select",
      options: [
        { value: "snake_case", label: "snake_case" },
        { value: "camelCase", label: "camelCase" },
        { value: "UPPERCASE", label: "UPPERCASE" }
      ],
      default: "snake_case",
      category: "Variable Naming"
    },

    // Debugging
    {
      id: "debugging",
      title: "Enable Debugging",
      description: "Enable debugging output (set -x)",
      type: "boolean",
      default: false,
      category: "Debugging"
    },

    // Comments
    {
      id: "commentStyle",
      title: "Comment Style",
      description: "Style for comments in the script",
      type: "select",
      options: [
        { value: "singleLine", label: "Single-line comments" },
        { value: "multiLine", label: "Multi-line comments" }
      ],
      default: "singleLine",
      category: "Comments"
    }
];
export const gitignoreFormatOptions = [
    // Line Endings
    {
      id: "lineEndings",
      title: "Line Endings",
      description: "Line ending style for .gitignore file",
      type: "select",
      options: [
        { value: "lf", label: "LF (Unix)" },
        { value: "crlf", label: "CRLF (Windows)" },
        { value: "auto", label: "Auto-detect" }
      ],
      default: "lf",
      category: "Line Endings"
    },

    // Wildcards
    {
      id: "wildcards",
      title: "Wildcard Support",
      description: "Enable wildcard support for ignoring files (e.g., *.log)",
      type: "boolean",
      default: true,
      category: "Wildcards"
    },

    // Comment Style
    {
      id: "commentStyle",
      title: "Comment Style",
      description: "Style for comments in the .gitignore file",
      type: "select",
      options: [
        { value: "#", label: "Hash (#) comments" },
        { value: "//", label: "Double Slash (//) comments" }
      ],
      default: "#",
      category: "Comments"
    },

    // Ignore Case Sensitivity
    {
      id: "ignoreCaseSensitivity",
      title: "Case Sensitivity",
      description: "Ignore case sensitivity when matching patterns",
      type: "boolean",
      default: false,
      category: "Case Sensitivity"
    },

    // Exclude Directories
    {
      id: "excludeDirs",
      title: "Exclude Directories",
      description: "Whether to exclude specific directories from being ignored",
      type: "boolean",
      default: true,
      category: "Directories"
    },

    // Specific File Extensions
    {
      id: "fileExtensions",
      title: "Specific File Extensions",
      description: "Enable/disable ignoring files with specific extensions (e.g., .log, .tmp)",
      type: "boolean",
      default: true,
      category: "File Extensions"
    },

    // Inherited Patterns
    {
      id: "inheritPatterns",
      title: "Inherit Patterns",
      description: "Inherit .gitignore patterns from global gitignore settings",
      type: "boolean",
      default: true,
      category: "Inherit Patterns"
    }
];
export const cssFormatOptions = [
    // Indentation
    {
      id: "indentSize",
      title: "Indent Size",
      description: "Number of spaces per indentation level",
      type: "number",
      default: 2,
      min: 1,
      max: 8,
      category: "Indentation"
    },
    
    // Line Length
    {
      id: "lineLength",
      title: "Line Length",
      description: "Maximum line length before wrapping",
      type: "number",
      default: 80,
      min: 40,
      max: 200,
      category: "Line Length"
    },
  
    // Semicolons
    {
      id: "semi",
      title: "Semicolons",
      description: "Use semicolons at the end of statements",
      type: "boolean",
      default: true,
      category: "Semicolons"
    },
  
    // Braces
    {
      id: "braceStyle",
      title: "Brace Style",
      description: "Where to place the opening brace",
      type: "select",
      options: [
        { value: "next-line", label: "Next line" },
        { value: "end-of-line", label: "End of line" }
      ],
      default: "next-line",
      category: "Braces"
    },
  
    // Quotes
    {
      id: "singleQuote",
      title: "Single Quotes",
      description: "Use single quotes for strings",
      type: "boolean",
      default: false,
      category: "Quotes"
    },
  
    // Spacing
    {
      id: "spacing",
      title: "Spacing Around Operators",
      description: "Add spaces around operators (e.g., +, -, *, /)",
      type: "boolean",
      default: true,
      category: "Spacing"
    },
  
    // Selector Prefix
    {
      id: "selectorPrefix",
      title: "Selector Prefix",
      description: "Use a prefix for CSS selectors",
      type: "string",
      default: "",
      category: "Selectors"
    },
  
    // Media Queries
    {
      id: "mediaQueries",
      title: "Media Queries",
      description: "Separate media queries into their own block",
      type: "boolean",
      default: false,
      category: "Media Queries"
    },
  
    // Formatting
    {
      id: "formatting",
      title: "CSS Formatting",
      description: "Enable/disable automatic formatting of CSS",
      type: "boolean",
      default: true,
      category: "Formatting"
    },
  
    // Vendor Prefixing
    {
      id: "vendorPrefixing",
      title: "Vendor Prefixing",
      description: "Enable automatic vendor prefixing for properties",
      type: "boolean",
      default: true,
      category: "Vendor Prefixing"
    }
];
export const envFormatOptions = [
    // Variable Names
    {
      id: "variableNaming",
      title: "Variable Naming",
      description: "Naming convention for environment variables",
      type: "select",
      options: [
        { value: "uppercase", label: "Uppercase" },
        { value: "lowercase", label: "Lowercase" },
        { value: "mixed-case", label: "Mixed case" }
      ],
      default: "uppercase",
      category: "Naming"
    },

    // Spacing
    {
      id: "spacingAroundEquals",
      title: "Spacing Around Equals",
      description: "Whether to include spaces around the equals sign in variable assignments",
      type: "boolean",
      default: false,
      category: "Formatting"
    },

    // Comments
    {
      id: "comments",
      title: "Comments",
      description: "Allow comments within .env files (prefixed by #)",
      type: "boolean",
      default: true,
      category: "Formatting"
    },

    // Line Endings
    {
      id: "lineEndings",
      title: "Line Endings",
      description: "Line ending style for the .env file",
      type: "select",
      options: [
        { value: "lf", label: "LF (Unix)" },
        { value: "crlf", label: "CRLF (Windows)" },
        { value: "auto", label: "Auto-detect" }
      ],
      default: "lf",
      category: "Line Endings"
    },

    // Quoting Values
    {
      id: "quoteValues",
      title: "Quote Values",
      description: "Whether to wrap values in double quotes",
      type: "boolean",
      default: false,
      category: "Values"
    },

    // Export
    {
      id: "exportSyntax",
      title: "Export Syntax",
      description: "Whether to use `export` for variable declaration",
      type: "boolean",
      default: false,
      category: "Syntax"
    }
];
export const mdFormatOptions = [
    // Line Endings
    {
      id: "lineEndings",
      title: "Line Endings",
      description: "Line ending style for Markdown file",
      type: "select",
      options: [
        { value: "lf", label: "LF (Unix)" },
        { value: "crlf", label: "CRLF (Windows)" },
        { value: "auto", label: "Auto-detect" }
      ],
      default: "lf",
      category: "Line Endings"
    },
  
    // Heading Style
    {
      id: "headingStyle",
      title: "Heading Style",
      description: "Style of markdown headings (e.g., # vs. ===)",
      type: "select",
      options: [
        { value: "atx", label: "ATX-style (#)" },
        { value: "setext", label: "Setext-style (===, ---)" }
      ],
      default: "atx",
      category: "Headings"
    },
  
    // List Style
    {
      id: "listStyle",
      title: "List Style",
      description: "Style for list items (e.g., - vs. *)",
      type: "select",
      options: [
        { value: "bullet", label: "Bullet lists" },
        { value: "ordered", label: "Ordered lists" }
      ],
      default: "bullet",
      category: "Lists"
    },
  
    // Emphasis Style
    {
      id: "emphasisStyle",
      title: "Emphasis Style",
      description: "Style for emphasizing text (e.g., * vs. _)",
      type: "select",
      options: [
        { value: "asterisk", label: "Asterisk (*)" },
        { value: "underscore", label: "Underscore (_)" }
      ],
      default: "asterisk",
      category: "Emphasis"
    },
  
    // Code Block Style
    {
      id: "codeBlockStyle",
      title: "Code Block Style",
      description: "Style for code blocks (e.g., fenced code blocks or indented)",
      type: "select",
      options: [
        { value: "fenced", label: "Fenced code blocks" },
        { value: "indented", label: "Indented code blocks" }
      ],
      default: "fenced",
      category: "Code Blocks"
    },
  
    // Table Alignment
    {
      id: "tableAlignment",
      title: "Table Alignment",
      description: "Table column alignment (left, center, right)",
      type: "select",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ],
      default: "left",
      category: "Tables"
    },
  
    // Link Style
    {
      id: "linkStyle",
      title: "Link Style",
      description: "Style for links (e.g., [text](url) vs. <a href='url'>text</a>)",
      type: "select",
      options: [
        { value: "in-line", label: "Inline-style" },
        { value: "html", label: "HTML-style" }
      ],
      default: "in-line",
      category: "Links"
    },
  
    // Image Style
    {
      id: "imageStyle",
      title: "Image Style",
      description: "Style for images (e.g., ![alt](url) vs. <img src='url' alt='alt' />)",
      type: "select",
      options: [
        { value: "in-line", label: "Inline-style" },
        { value: "html", label: "HTML-style" }
      ],
      default: "in-line",
      category: "Images"
    },
  
    // Quote Style
    {
      id: "quoteStyle",
      title: "Quote Style",
      description: "Style for blockquotes (e.g., > vs. indented)",
      type: "select",
      options: [
        { value: "greater-than", label: "Greater-than (>)" },
        { value: "indented", label: "Indented" }
      ],
      default: "greater-than",
      category: "Quotes"
    },
  
    // Line Breaks
    {
      id: "lineBreaks",
      title: "Line Breaks",
      description: "Whether to add hard line breaks (e.g., two spaces at the end of a line)",
      type: "boolean",
      default: false,
      category: "Line Breaks"
    }
];
export const lessFormatOptions = [
    // Indentation
    {
      id: "indentSize",
      title: "Indent Size",
      description: "Number of spaces per indentation level",
      type: "number",
      default: 2,
      min: 1,
      max: 8,
      category: "Indentation"
    },
    {
      id: "tabWidth",
      title: "Tab Width",
      description: "Number of spaces a tab represents",
      type: "number",
      default: 2,
      min: 1,
      max: 8,
      category: "Indentation"
    },
    {
      id: "useTabs",
      title: "Use Tabs",
      description: "Use tabs instead of spaces for indentation",
      type: "boolean",
      default: false,
      category: "Indentation"
    },

    // Line Length
    {
      id: "maxLineLength",
      title: "Max Line Length",
      description: "Maximum line length before wrapping",
      type: "number",
      default: 80,
      min: 40,
      max: 200,
      category: "Line Length"
    },

    // Comments
    {
      id: "commentStyle",
      title: "Comment Style",
      description: "Style for comments in LESS files",
      type: "select",
      options: [
        { value: "single-line", label: "Single-line comments" },
        { value: "multi-line", label: "Multi-line comments" }
      ],
      default: "single-line",
      category: "Comments"
    },

    // Variables
    {
      id: "variableNaming",
      title: "Variable Naming",
      description: "Naming convention for LESS variables",
      type: "select",
      options: [
        { value: "snake_case", label: "Snake_case" },
        { value: "camelCase", label: "CamelCase" },
        { value: "kebab-case", label: "Kebab-case" }
      ],
      default: "camelCase",
      category: "Variables"
    },

    // Mixin
    {
      id: "mixinStyle",
      title: "Mixin Style",
      description: "Style of defining mixins in LESS",
      type: "select",
      options: [
        { value: "traditional", label: "Traditional mixins" },
        { value: "extended", label: "Extended mixins" }
      ],
      default: "traditional",
      category: "Mixins"
    },

    // Nesting
    {
      id: "maxNestingDepth",
      title: "Max Nesting Depth",
      description: "Maximum number of levels of nesting",
      type: "number",
      default: 3,
      min: 1,
      max: 10,
      category: "Nesting"
    },

    // Formatting
    {
      id: "spaceBetweenProperties",
      title: "Space Between Properties",
      description: "Whether to add space between properties",
      type: "boolean",
      default: true,
      category: "Formatting"
    },

    // Line Breaks
    {
      id: "lineBreaks",
      title: "Line Breaks",
      description: "Line break style (e.g., new line after each property)",
      type: "boolean",
      default: false,
      category: "Formatting"
    }
];
export const jpgFormatOptions = [
    // Compression
    {
      id: "quality",
      title: "Quality",
      description: "JPEG quality level (0-100)",
      type: "number",
      default: 75,
      min: 0,
      max: 100,
      category: "Compression"
    },

    // Color Mode
    {
      id: "colorMode",
      title: "Color Mode",
      description: "Color mode for the image",
      type: "select",
      options: [
        { value: "rgb", label: "RGB" },
        { value: "cmyk", label: "CMYK" }
      ],
      default: "rgb",
      category: "Color"
    },

    // Progressive
    {
      id: "progressive",
      title: "Progressive",
      description: "Enable progressive JPEG (multiple loading passes)",
      type: "boolean",
      default: false,
      category: "Optimization"
    },

    // Metadata
    {
      id: "stripMetadata",
      title: "Strip Metadata",
      description: "Remove metadata to reduce file size",
      type: "boolean",
      default: true,
      category: "Metadata"
    },

    // Color Space
    {
      id: "colorSpace",
      title: "Color Space",
      description: "Color space used for the image",
      type: "select",
      options: [
        { value: "sRGB", label: "sRGB" },
        { value: "AdobeRGB", label: "AdobeRGB" },
        { value: "ProPhotoRGB", label: "ProPhotoRGB" }
      ],
      default: "sRGB",
      category: "Color"
    },

    // Subsampling
    {
      id: "subsampling",
      title: "Subsampling",
      description: "Chroma subsampling method",
      type: "select",
      options: [
        { value: "4:4:4", label: "4:4:4 (no subsampling)" },
        { value: "4:2:2", label: "4:2:2" },
        { value: "4:2:0", label: "4:2:0" }
      ],
      default: "4:2:0",
      category: "Compression"
    }
];
export const woff2FormatOptions = [
    // Compression
    {
      id: "compressionLevel",
      title: "Compression Level",
      description: "Level of compression for the font (0-9)",
      type: "number",
      default: 6,
      min: 0,
      max: 9,
      category: "Compression"
    },

    // Font Style
    {
      id: "fontStyle",
      title: "Font Style",
      description: "Style of the font (e.g., regular, italic)",
      type: "select",
      options: [
        { value: "normal", label: "Normal" },
        { value: "italic", label: "Italic" },
        { value: "oblique", label: "Oblique" }
      ],
      default: "normal",
      category: "Font Style"
    },

    // Font Weight
    {
      id: "fontWeight",
      title: "Font Weight",
      description: "Weight of the font (e.g., 400 for normal, 700 for bold)",
      type: "select",
      options: [
        { value: 100, label: "100" },
        { value: 200, label: "200" },
        { value: 300, label: "300" },
        { value: 400, label: "400 (Normal)" },
        { value: 500, label: "500" },
        { value: 600, label: "600" },
        { value: 700, label: "700 (Bold)" },
        { value: 800, label: "800" },
        { value: 900, label: "900" }
      ],
      default: 400,
      category: "Font Weight"
    },

    // Font Stretch
    {
      id: "fontStretch",
      title: "Font Stretch",
      description: "Stretch of the font (e.g., condensed, expanded)",
      type: "select",
      options: [
        { value: "normal", label: "Normal" },
        { value: "condensed", label: "Condensed" },
        { value: "expanded", label: "Expanded" }
      ],
      default: "normal",
      category: "Font Stretch"
    },

    // Metadata
    {
      id: "embedMetadata",
      title: "Embed Metadata",
      description: "Embed font metadata in the file",
      type: "boolean",
      default: true,
      category: "Metadata"
    },

    // Unicode Range
    {
      id: "unicodeRange",
      title: "Unicode Range",
      description: "Character set or Unicode range to include in the font",
      type: "text",
      default: "all",
      category: "Unicode Range"
    }
];
export const mp4FormatOptions = [
    // Video Quality
    {
      id: "videoQuality",
      title: "Video Quality",
      description: "Quality of the video (0-100)",
      type: "number",
      default: 75,
      min: 0,
      max: 100,
      category: "Video"
    },

    // Video Codec
    {
      id: "videoCodec",
      title: "Video Codec",
      description: "Codec used for video compression",
      type: "select",
      options: [
        { value: "h264", label: "H.264" },
        { value: "h265", label: "H.265 (HEVC)" },
        { value: "vp9", label: "VP9" }
      ],
      default: "h264",
      category: "Video"
    },

    // Audio Quality
    {
      id: "audioQuality",
      title: "Audio Quality",
      description: "Quality of the audio (0-100)",
      type: "number",
      default: 128,
      min: 0,
      max: 320,
      category: "Audio"
    },

    // Audio Codec
    {
      id: "audioCodec",
      title: "Audio Codec",
      description: "Codec used for audio compression",
      type: "select",
      options: [
        { value: "aac", label: "AAC" },
        { value: "mp3", label: "MP3" },
        { value: "opus", label: "Opus" }
      ],
      default: "aac",
      category: "Audio"
    },

    // Resolution
    {
      id: "resolution",
      title: "Resolution",
      description: "Resolution of the video (e.g., 720p, 1080p)",
      type: "select",
      options: [
        { value: "720p", label: "720p" },
        { value: "1080p", label: "1080p" },
        { value: "1440p", label: "1440p" },
        { value: "4k", label: "4k" }
      ],
      default: "1080p",
      category: "Video"
    },

    // Frame Rate
    {
      id: "frameRate",
      title: "Frame Rate",
      description: "Frames per second (fps) of the video",
      type: "select",
      options: [
        { value: "24", label: "24 fps" },
        { value: "30", label: "30 fps" },
        { value: "60", label: "60 fps" }
      ],
      default: "30",
      category: "Video"
    },

    // Aspect Ratio
    {
      id: "aspectRatio",
      title: "Aspect Ratio",
      description: "Aspect ratio of the video (e.g., 16:9, 4:3)",
      type: "select",
      options: [
        { value: "16:9", label: "16:9" },
        { value: "4:3", label: "4:3" },
        { value: "21:9", label: "21:9" }
      ],
      default: "16:9",
      category: "Video"
    },

    // Bitrate
    {
      id: "bitrate",
      title: "Bitrate",
      description: "Video bitrate in kbps",
      type: "number",
      default: 5000,
      min: 1000,
      max: 20000,
      category: "Video"
    },

    // Metadata
    {
      id: "embedMetadata",
      title: "Embed Metadata",
      description: "Embed metadata (e.g., title, artist) in the video file",
      type: "boolean",
      default: true,
      category: "Metadata"
    }
];
export const pdfFormatOptions = [
    // Compression
    {
      id: "compressionLevel",
      title: "Compression Level",
      description: "Level of PDF compression (0-9)",
      type: "number",
      default: 5,
      min: 0,
      max: 9,
      category: "Compression"
    },

    // Image Quality
    {
      id: "imageQuality",
      title: "Image Quality",
      description: "Quality of images embedded in the PDF (0-100)",
      type: "number",
      default: 80,
      min: 0,
      max: 100,
      category: "Images"
    },

    // Text Compression
    {
      id: "textCompression",
      title: "Text Compression",
      description: "Enable or disable compression for text",
      type: "boolean",
      default: true,
      category: "Text"
    },

    // Metadata
    {
      id: "embedMetadata",
      title: "Embed Metadata",
      description: "Embed document metadata (author, title, etc.) in the PDF",
      type: "boolean",
      default: true,
      category: "Metadata"
    },

    // Password Protection
    {
      id: "passwordProtection",
      title: "Password Protection",
      description: "Password protect the PDF document",
      type: "boolean",
      default: false,
      category: "Security"
    },

    // Page Size
    {
      id: "pageSize",
      title: "Page Size",
      description: "Size of the pages in the document",
      type: "select",
      options: [
        { value: "A4", label: "A4" },
        { value: "Letter", label: "Letter" },
        { value: "Legal", label: "Legal" }
      ],
      default: "A4",
      category: "Pages"
    },

    // Orientation
    {
      id: "orientation",
      title: "Page Orientation",
      description: "Orientation of the pages in the document",
      type: "select",
      options: [
        { value: "portrait", label: "Portrait" },
        { value: "landscape", label: "Landscape" }
      ],
      default: "portrait",
      category: "Pages"
    },

    // Embed Fonts
    {
      id: "embedFonts",
      title: "Embed Fonts",
      description: "Embed fonts used in the document to ensure proper display",
      type: "boolean",
      default: true,
      category: "Fonts"
    },

    // Links and Bookmarks
    {
      id: "embedLinks",
      title: "Embed Links and Bookmarks",
      description: "Embed hyperlinks and bookmarks in the PDF",
      type: "boolean",
      default: true,
      category: "Links"
    },

    // Watermark
    {
      id: "watermark",
      title: "Watermark",
      description: "Apply a watermark to each page in the document",
      type: "text",
      default: "",
      category: "Watermark"
    }
];
export const mp3FormatOptions = [
    // Bitrate
    {
      id: "bitrate",
      title: "Bitrate",
      description: "Audio bitrate (kbps)",
      type: "number",
      default: 192,
      min: 64,
      max: 320,
      category: "Audio"
    },

    // Sample Rate
    {
      id: "sampleRate",
      title: "Sample Rate",
      description: "Sample rate (Hz)",
      type: "select",
      options: [
        { value: 44100, label: "44.1 kHz" },
        { value: 48000, label: "48 kHz" },
        { value: 96000, label: "96 kHz" }
      ],
      default: 44100,
      category: "Audio"
    },

    // Channels
    {
      id: "channels",
      title: "Channels",
      description: "Number of audio channels",
      type: "select",
      options: [
        { value: 1, label: "Mono" },
        { value: 2, label: "Stereo" }
      ],
      default: 2,
      category: "Audio"
    },

    // Compression
    {
      id: "compression",
      title: "Compression",
      description: "Enable or disable compression",
      type: "boolean",
      default: true,
      category: "Audio"
    },

    // Normalize Volume
    {
      id: "normalizeVolume",
      title: "Normalize Volume",
      description: "Normalize the audio volume to a consistent level",
      type: "boolean",
      default: false,
      category: "Audio"
    },

    // Metadata
    {
      id: "embedMetadata",
      title: "Embed Metadata",
      description: "Embed metadata (title, artist, album) in the audio file",
      type: "boolean",
      default: true,
      category: "Metadata"
    },

    // Tags
    {
      id: "tags",
      title: "Audio Tags",
      description: "Include custom tags (e.g., album, artist, genre)",
      type: "boolean",
      default: true,
      category: "Metadata"
    },

    // Error Protection
    {
      id: "errorProtection",
      title: "Error Protection",
      description: "Enable error protection for better playback quality",
      type: "boolean",
      default: false,
      category: "Audio"
    }
];
export const fortmatterDefaults = [
    {
        "tsx": tsxFormatOptions,
        "json": jsonFormatOptions,
        "html": htmlFormatOptions,
        "md": mdFormatOptions,
        "css": cssFormatOptions,
        "scss": scssFormatOptions,
        "less": lessFormatOptions,
        "svg": svgFormatOptions,
        "png": pngFormatOptions,
        "jpg": jpgFormatOptions,
        "gif": gifFormatOptions,
        "webp": webmFormatOptions,
        "woff": woffFormatOptions,
        "woff2": woff2FormatOptions,
        "mp4": mp4FormatOptions,
        "webm": webmFormatOptions,
        "mp3": mp3FormatOptions,
        "pdf": pdfFormatOptions,
        "txt": txtFormatOptions,
        "csv": csvFormatOptions,
        "yaml": undefined,
        "xml": undefined,
        "graphql": undefined,
        "sh": shFormatOptions,
        "Dockerfile", : undefined,
        "gitignore": gitignoreFormatOptions,
        "env": envFormatOptions,
    }
]
//#endregion




