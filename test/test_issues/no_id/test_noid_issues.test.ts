import { z } from "zod";
import { extendZod } from "../../../dist";
extendZod(z);

import { describe } from "vitest";
import { runCase1Suite } from "./1/case_1.test-suite";

describe("Test issues - No id", () => {
    runCase1Suite();
});
