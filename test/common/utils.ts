import * as fs from "fs";
import { diffLines } from "diff";
import { expect, describe, test } from "vitest";

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

/**
 * Used for testing github issues.
 */
export const createGenericTestSuite = (
    suiteName: string,
    model: any,
    transpiler: any,
    basePath: string,
    language: "typescript" | "python" | "cpp" | "golang" = "typescript"
) => {
    const fileNamePrefix = suiteName.toLowerCase().replace(/\s+/g, "_");

    return () => {
        describe(suiteName, () => {
            if (language === "python") {
                test("Output as Python Class", () => {
                    const output = model.transpile(transpiler);
                    const expectedOutput = fs
                        .readFileSync(
                            `${basePath}/class-expected/${fileNamePrefix}.expected_python.py`
                        )
                        .toString();

                    testOutput(
                        output,
                        expectedOutput,
                        `${basePath}/class-expected/err-${fileNamePrefix}.expected_python.py`
                    );
                });
            } else if (language === "cpp") {
                test("Output as C++ Struct", () => {
                    const output = model.transpile(transpiler);
                    const expectedOutput = fs
                        .readFileSync(
                            `${basePath}/struct-expected/${fileNamePrefix}.expected_cpp.h`
                        )
                        .toString();

                    testOutput(
                        output,
                        expectedOutput,
                        `${basePath}/struct-expected/err-${fileNamePrefix}.expected_cpp.h`
                    );
                });

                test("Output as C++ Class", () => {
                    const output = model.transpile(transpiler, { outType: "class" });
                    const expectedOutput = fs
                        .readFileSync(`${basePath}/class-expected/${fileNamePrefix}.expected_cpp.h`)
                        .toString();

                    testOutput(
                        output,
                        expectedOutput,
                        `${basePath}/class-expected/err-${fileNamePrefix}.expected_cpp.h`
                    );
                });
            } else if (language === "golang") {
                test("Output as Go Struct", () => {
                    const output = model.transpile(transpiler);
                    const expectedOutput = fs
                        .readFileSync(
                            `${basePath}/struct-expected/${fileNamePrefix}.expected_go.go`
                        )
                        .toString();

                    testOutput(
                        output,
                        expectedOutput,
                        `${basePath}/struct-expected/err-${fileNamePrefix}.expected_go.go`
                    );
                });
            } else {
                test("Output as Typescript Struct", () => {
                    const output = model.transpile(transpiler);
                    const expectedOutput = fs
                        .readFileSync(
                            `${basePath}/struct-expected/${fileNamePrefix}.expected_typescript.ts`
                        )
                        .toString();

                    testOutput(
                        output,
                        expectedOutput,
                        `${basePath}/struct-expected/err-${fileNamePrefix}.expected_typescript.ts`
                    );
                });

                test("Output as Typescript Class", () => {
                    const output = model.transpile(transpiler, {
                        outType: "class",
                    });
                    const expectedOutput = fs
                        .readFileSync(
                            `${basePath}/class-expected/${fileNamePrefix}.expected_typescript.ts`
                        )
                        .toString();

                    testOutput(
                        output,
                        expectedOutput,
                        `${basePath}/class-expected/err-${fileNamePrefix}.expected_typescript.ts`
                    );
                });
            }
        });
    };
};
