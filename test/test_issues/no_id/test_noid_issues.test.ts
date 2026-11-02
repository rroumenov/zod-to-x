import { z } from "zod/v4";
import { extendZod } from "../../../dist";
extendZod(z);

import { describe } from "vitest";
import { runCase1Suite } from "./1/case_1.test-suite";
import { runCase2Suite } from "./2/case_2.test-suite";
import { runCase3Suite } from "./3/case_3.test-suite";
import { runCase4Suite } from "./4/case_4.test-suite";
import { runCase5Suite } from "./5/case_5.test-suite";
import { runCase6Suite } from "./6/case_6.test-suite";
import { runCase7Suite } from "./7/case_7.test-suite";
import { runCase8Suite } from "./8/case_8.test-suite";
import { runCase9Suite } from "./9/case_9.test-suite";
import { runCase10Suite } from "./10/case_10.test-suite";

describe("Test issues - No id", () => {
    runCase1Suite();
    runCase2Suite();
    runCase3Suite();
    runCase4Suite();
    runCase5Suite();
    runCase6Suite();
    runCase7Suite();
    runCase8Suite();
    runCase9Suite();
    runCase10Suite();
});
