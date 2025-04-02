/**
     * Removes trailing commas from JSON strings
     * @param {string} jsonString - The JSON string to fix
     * @returns {string} - The fixed JSON string
     */
function fixTrailingCommas(jsonString) {
    // Fix object trailing commas - match a comma followed by optional whitespace and then a closing brace
    jsonString = jsonString.replace(/,(\s*})/g, '$1');

    // Fix array trailing commas - match a comma followed by optional whitespace and then a closing bracket
    jsonString = jsonString.replace(/,(\s*\])/g, '$1');

    return jsonString;
}