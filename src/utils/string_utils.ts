
export default class StringUtils {
    /**
     * Converts a PascalCase or camelCase string to snake_case.
     * @param input - The string to convert.
     * @returns The snake_case version of the input string.
     */
    static toSnakeCase(input: string): string {
        return input
        .replace(/([a-z])([A-Z])/g, "$1_$2") // Underscore between lowercase and uppercase letters
        .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2") // Handle cases like "HTMLParser" -> "HTML_Parser"
        .toLowerCase();
    }

    /**
     * Converts a capitalized string (e.g., HelloWorld) to a non-capitalized string
     * (e.g., helloWorld).
     * @param input - The string to convert.
     * @returns The non-capitalized version of the input string.
     */
    static toNonCapitalized(input: string): string {
        if (!input) return input;
        return input.charAt(0).toLowerCase() + input.slice(1);
    }

    /**
     * Converts a snake_case string to camelCase.
     * @param input - The snake_case string to convert.
     * @returns The camelCase version of the input string.
     */
    static toCamelCase(input: string): string {
        return input
        .toLowerCase() // Ensure the input is all lowercase
        .split('_') // Split the string by underscores
        .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        ) // Capitalize each word except the first one
        .join(''); // Join the words back together
    }
}