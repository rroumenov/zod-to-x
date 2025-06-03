import * as fs from "fs";
import { diffLines } from "diff";
import { expect } from "vitest";

export const testOutput = (output: string, expectedOutput: string, outputPath?: string) => {
    try {
        expect(output.trim()).toBe(expectedOutput.trim());
    } catch (error) {
        const diffs = diffLines(output.trim(), expectedOutput.trim());
        diffs.forEach((part) => {
            const color = part.added ? "\x1b[32m" : part.removed ? "\x1b[31m" : "\x1b[0m";
            process.stdout.write(color + part.value + "\x1b[0m");
        });
        if (outputPath) {
            fs.writeFileSync(outputPath, output);
        }
        throw error;
    }
};
