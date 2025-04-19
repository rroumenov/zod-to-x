/** Different levels of indentation */
export type TIndentationLevels = [string, string, string, string, string];

export default class StringUtils {
    /**
     * Generates a list of strings representing different levels of indentation.
     * Useful for formatting code or generating spaces in a transpilated output.
     * The first element is an empty string to represent zero indentation.
     * @param indentSize - The number of spaces for a single indentation level.
     * @returns An array containing strings for 0x, 1x, 2x, 3x, and 4x the specified indentation
     *          size.
     */
    static getIndentationLevels(indentSize: number): [string, string, string, string, string] {
        return [
            "", // Represents zero indentation.
            " ".repeat(indentSize),
            " ".repeat(indentSize * 2),
            " ".repeat(indentSize * 3),
            " ".repeat(indentSize * 4),
        ];
    }

    /**
     * Converts the first character of a string to lowercase while leaving the rest of the string
     * unchanged.
     *
     * @param str - The input string to process.
     * @returns A new string with the first character converted to lowercase.
     */
    static lowerFirstChar(str: string): string {
        if (str.length === 0) return str;
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
}
