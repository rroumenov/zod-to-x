import { z } from "zod";
import { extendZod } from "../../../dist";
extendZod(z);

import { runCase1Suite } from "./1/case_1.test-suite";

describe("Test issues - No id", () => {
    runCase1Suite();

    // test("Test issues - No id - Case 1 as Typescript Struct", () => {
    //     const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts);
    //     const expectedOutput = fs
    //         .readFileSync(
    //             "./test/test_issues/no_id/1/struct-expected/case_1.expected_typescript.ts"
    //         )
    //         .toString();

    //     try {
    //         expect(output.trim()).toBe(expectedOutput.trim());
    //     } catch (error) {
    //         diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
    //         fs.writeFileSync(
    //             "./test/test_issues/no_id/1/struct-expected/err-case_1.expected_typescript.ts",
    //             output
    //         );
    //         throw error;
    //     }
    // });

    // test("Test issues - No id - Case 1 as Typescript Class", () => {
    //     const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts, {outType: "class"});
    //     const expectedOutput = fs
    //         .readFileSync(
    //             "./test/test_issues/no_id/1/class-expected/case_1.expected_typescript.ts"
    //         )
    //         .toString();

    //     try {
    //         expect(output.trim()).toBe(expectedOutput.trim());
    //     } catch (error) {
    //         diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
    //         fs.writeFileSync(
    //             "./test/test_issues/no_id/1/class-expected/err-case_1.expected_typescript.ts",
    //             output
    //         );
    //         throw error;
    //     }
    // });
});
