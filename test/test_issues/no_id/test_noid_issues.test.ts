import { z } from "zod/v4";
import { extendZod } from "../../../dist";
extendZod(z);

import { describe } from "vitest";
import { runCase1Suite } from "./1/case_1.test-suite";

describe("Test issues - No id", () => {
    runCase1Suite();
});
