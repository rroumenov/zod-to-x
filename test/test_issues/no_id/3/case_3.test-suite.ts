import { Zod2XTranspilers } from "../../../../dist";

import { describe, test } from "vitest";
import * as fs from "fs";
import { weatherServiceApi } from "./case_3";
import { testOutput } from "../../../common/utils";

export const runCase3Suite = () => {
    describe("Case 3", () => {
        test("Output as Typescript Struct", () => {
            const output = weatherServiceApi.transpile(Zod2XTranspilers.Zod2Ts);
            const expectedOutput = fs
                .readFileSync(
                    "./test/test_issues/no_id/3/struct-expected/case_3.expected_typescript.ts"
                )
                .toString();

            testOutput(
                output,
                expectedOutput,
                "./test/test_issues/no_id/3/struct-expected/err-case_3.expected_typescript.ts"
            );
        });

        test("Output as Typescript Class", () => {
            const output = weatherServiceApi.transpile(Zod2XTranspilers.Zod2Ts, {
                outType: "class",
            });
            const expectedOutput = fs
                .readFileSync(
                    "./test/test_issues/no_id/3/class-expected/case_3.expected_typescript.ts"
                )
                .toString();

            testOutput(
                output,
                expectedOutput,
                "./test/test_issues/no_id/3/class-expected/err-case_3.expected_typescript.ts"
            );
        });
    });
};
