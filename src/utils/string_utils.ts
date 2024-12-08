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
            "",                          // Represents zero indentation.
            " ".repeat(indentSize),
            " ".repeat(indentSize * 2),
            " ".repeat(indentSize * 3),
            " ".repeat(indentSize * 4),
        ];
    }
}