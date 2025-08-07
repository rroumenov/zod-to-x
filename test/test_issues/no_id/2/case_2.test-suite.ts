import { Zod2XTranspilers } from "../../../../dist";

import { describe, test } from "vitest";
import * as fs from "fs";
import { userDtos } from "./case_2";
import { testOutput } from "../../../common/utils";

export const runCase2Suite = () => {
    describe("Case 2", () => {
        test("Output as Typescript Struct", () => {
            const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts);
            const expectedOutput = fs
                .readFileSync(
                    "./test/test_issues/no_id/2/struct-expected/case_2.expected_typescript.ts"
                )
                .toString();

            testOutput(
                output,
                expectedOutput,
                "./test/test_issues/no_id/2/struct-expected/err-case_2.expected_typescript.ts"
            );
        });

        test("Output as Typescript Class", () => {
            const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts, { outType: "class" });
            const expectedOutput = fs
                .readFileSync(
                    "./test/test_issues/no_id/2/class-expected/case_2.expected_typescript.ts"
                )
                .toString();

            testOutput(
                output,
                expectedOutput,
                "./test/test_issues/no_id/2/class-expected/err-case_2.expected_typescript.ts"
            );
        });
    });
};
