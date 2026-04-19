---
name: add-issue-test
description: |
    A skill for adding a new issue/regression test case to the codebase. This is used when a new bug or edge case is discovered, either from a GitHub issue or internal testing. The skill guides you through creating a minimal reproducing schema, writing the expected output, and verifying the test fails before fixing the bug.
---

## Structure

Issue tests live in `test/test_issues/`:
- `no_id/` — Internally detected issues (numbered sequentially: 1, 2, 3, ...)
- `id/` — GitHub issues (folder name = issue number) — *will exist when needed*

## Step-by-Step

### 1. Determine the Next Index

Check existing folders in `test/test_issues/no_id/` (or `id/`) to find the next number.

### 2. Create the Folder

```bash
mkdir -p test/test_issues/no_id/N/struct-expected test/test_issues/no_id/N/class-expected
```

### 3. Create the Case File (`case_N.ts`)

```typescript
/**
 * Case N: Brief description of the bug/edge case
 * 
 * Describe what was failing and why.
 */
import { z } from "zod";
import { extendZod, Domain, Application, Zod2XModel } from "../../../dist";
extendZod(z);

// Define the problematic schema(s) using layered modeling
@Domain({ file: "case_N_domain", namespace: "case_N_domain" })
class CaseNDomain extends Zod2XModel {
    // Schema properties that reproduce the bug
    myType = z.object({
        field: z.string(),
    });
}

// Add more layers if the bug involves cross-layer references
@Application({ file: "case_N_app", namespace: "case_N_app" })
class CaseNApp extends Zod2XModel {
    // ...
}

// Export the model that should be tested
export const caseNModel = new CaseNApp();
```

### 4. Create the Test Suite (`case_N.test-suite.ts`)

```typescript
import { Zod2XTranspilers } from "../../../dist";
import { createGenericTestSuite } from "../../common/utils";
import { caseNModel } from "./case_N";

export const runCaseNSuite = createGenericTestSuite(
    "Case N",
    caseNModel,
    Zod2XTranspilers.Zod2Ts,  // or the relevant transpiler
    "./test/test_issues/no_id/N"
);
```

### 5. Create Expected Output Files

Create both:
- `struct-expected/case_N.expected_typescript.ts` — expected interface/struct output
- `class-expected/case_N.expected_typescript.ts` — expected class output

**Important:** Write what the output SHOULD be (the correct behavior), not what it currently produces.

File naming convention: `case_N.expected_typescript.ts` where N matches the folder number. The name is derived from the suite name: `"Case N"` → `case_n`.

### 6. Register in the Facade

Edit `test/test_issues/no_id/test_noid_issues.test.ts`:

```typescript
import { runCaseNSuite } from "./N/case_N.test-suite";

describe("Test issues - No id", () => {
    // ... existing cases
    runCaseNSuite();
});
```

### 7. Verify the Test Fails

```bash
npm run build && npm test
```

The new test should **fail** — this confirms it captures the bug.

### 8. Fix the Bug

Analyze the failure and fix the source code (usually in `src/transpilers/` or `src/core/`).

### 9. Verify All Tests Pass

```bash
npm run build && npm test
```

ALL tests must pass, not just the new one.

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Folder | Sequential number | `5/` |
| Case file | `case_N.ts` | `case_5.ts` |
| Test suite | `case_N.test-suite.ts` | `case_5.test-suite.ts` |
| Expected struct | `case_N.expected_typescript.ts` | `case_5.expected_typescript.ts` |
| Expected class | `case_N.expected_typescript.ts` | `case_5.expected_typescript.ts` |
| Suite function | `runCaseNSuite` | `runCase5Suite` |
| Suite name | `"Case N"` | `"Case 5"` |

## Tips

- Start with the simplest schema that reproduces the bug
- If the bug is language-specific, use the corresponding transpiler in the test suite
- The `createGenericTestSuite` helper tests both struct and class modes automatically
- Look at existing cases in `test/test_issues/no_id/1/` through `5/` for reference patterns
- When a bug involves generics, use `createGenericType` and `useGenericType` in the case file
