import { z } from "zod";
import { extendZod } from "../../../dist";
extendZod(z);

import { describe } from "vitest";
import { runCase1Suite } from "./1/case_1.test-suite";
import { runCase2Suite } from "./2/case_2.test-suite";
import { runCase3Suite } from "./3/case_3.test-suite";
import { runCase4Suite } from "./4/case_4.test-suite";
import { runCase5Suite } from "./5/case_5.test-suite";

describe("Test issues - No id", () => {
    runCase1Suite();
    runCase2Suite();
    runCase3Suite();
    runCase4Suite();
    runCase5Suite();
});
