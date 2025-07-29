import { z } from "zod/v4";
import { extendZod } from "../../../dist";
extendZod(z);

import { describe } from "vitest";
import { runCase1Suite } from "./1/case_1.test-suite";
import { runCase2Suite } from "./2/case_2.test-suite";
import { runCase3Suite } from "./3/case_3.test-suite";

describe("Test issues - No id", () => {
    runCase1Suite();
    runCase2Suite();
    runCase3Suite();
});
