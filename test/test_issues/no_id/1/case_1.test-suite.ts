import { Zod2XTranspilers } from "../../../../dist";

import * as fs from "fs";
import { diffLinesRaw } from "jest-diff";
import { userDtos } from "./case_1";

export const runCase1Suite = () => {
    describe("Case 1", () => {
        test("Output as Typescript Struct", () => {
            const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts);
            const expectedOutput = fs
                .readFileSync(
                    "./test/test_issues/no_id/1/struct-expected/case_1.expected_typescript.ts"
                )
                .toString();

            try {
                expect(output.trim()).toBe(expectedOutput.trim());
            } catch (error) {
                diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
                fs.writeFileSync(
                    "./test/test_issues/no_id/1/struct-expected/err-case_1.expected_typescript.ts",
                    output
                );
                throw error;
            }
        });

        test("Output as Typescript Class", () => {
            const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts, { outType: "class" });
            const expectedOutput = fs
                .readFileSync(
                    "./test/test_issues/no_id/1/class-expected/case_1.expected_typescript.ts"
                )
                .toString();

            try {
                expect(output.trim()).toBe(expectedOutput.trim());
            } catch (error) {
                diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
                fs.writeFileSync(
                    "./test/test_issues/no_id/1/class-expected/err-case_1.expected_typescript.ts",
                    output
                );
                throw error;
            }
        });
    });
};
