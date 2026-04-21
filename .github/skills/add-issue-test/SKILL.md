---
name: add-issue-test
description: |
    A skill for adding a new issue/regression test case to the codebase. This is used when a new bug or edge case is discovered, either from a GitHub issue or internal testing. The skill guides you through creating a minimal reproducing schema, writing the expected output, and verifying the test fails before fixing the bug.
---

## Critical Rule: Multi-Language Coverage

Every issue test MUST include expected output files for **ALL supported transpilers** where the bug or its fix applies:
- **TypeScript** — `.expected_typescript.ts`
- **Python** — `.expected_python.py`
- **C++** — `.expected_cpp.h`

If a bug is in `src/core/` (AST or base transpiler), it affects all languages — test all of them. If a bug is in a specific transpiler (e.g., `src/transpilers/python/runner.ts`), check whether the same flaw exists in other transpilers and test those too.

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

The test suite must test ALL affected transpilers. Use `createGenericTestSuite` for each language, but keep them **private** (not exported). Export a single `runCaseNSuite` that calls all of them — this is what the facade uses:

```typescript
import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { caseNModel } from "./case_N";

// TypeScript tests (internal)
const runCaseNTsSuite = createGenericTestSuite(
    "Case N",
    caseNModel,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/N"
);

// Python tests (internal)
const runCaseNPySuite = createGenericTestSuite(
    "Case N",
    caseNModel,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/N",
    "python"
);

// C++ tests (internal)
const runCaseNCppSuite = createGenericTestSuite(
    "Case N",
    caseNModel,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/N",
    "cpp"
);

// Single exported entry point for the facade
export const runCaseNSuite = () => {
    runCaseNTsSuite();
    runCaseNPySuite();
    runCaseNCppSuite();
};
```

Note: `createGenericTestSuite` accepts an optional `language` parameter (`"typescript"` | `"python"` | `"cpp"`, defaults to `"typescript"`). It handles the correct expected file names and test modes per language automatically — see `test/common/utils.ts`.

### 5. Create Expected Output Files

Create expected output files for **every affected transpiler**:

**TypeScript:**
- `struct-expected/case_N.expected_typescript.ts`
- `class-expected/case_N.expected_typescript.ts`

**Python** (no struct mode — Python only has classes):
- `class-expected/case_N.expected_python.py`

**C++:**
- `struct-expected/case_N.expected_cpp.h`
- `class-expected/case_N.expected_cpp.h`

**Important:** Write what the output SHOULD be (the correct behavior), not what it currently produces.

File naming convention: `case_N.expected_<language>.<ext>` where N matches the folder number. The prefix is derived from the suite name: `"Case N"` → `case_n`.

### Determining Which Languages to Cover

| Bug location | Languages to test |
|---|---|
| `src/core/ast_node.ts` | ALL (TS + Py + C++) |
| `src/core/transpiler.ts` | ALL (TS + Py + C++) |
| `src/lib/zod_helpers.ts` | ALL (TS + Py + C++) |
| `src/lib/zod_ext.ts` | ALL (TS + Py + C++) |
| `src/layered-modeling/` | ALL (TS + Py + C++) |
| `src/transpilers/typescript/` | TypeScript (check if Python/C++ have same issue) |
| `src/transpilers/python/` | Python (check if TS/C++ have same issue) |
| `src/transpilers/cpp/` | C++ (check if TS/Py have same issue) |
| `src/converters/protobuf_v3/` | Protobuf only |

### 6. Register in the Facade

Edit `test/test_issues/no_id/test_noid_issues.test.ts`. Import and call only the single exported suite — the per-language breakdown is an internal detail of the suite file:

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
| Folder | Sequential number | `6/` |
| Case file | `case_N.ts` | `case_6.ts` |
| Test suite | `case_N.test-suite.ts` | `case_6.test-suite.ts` |
| Expected TS struct | `case_N.expected_typescript.ts` | `case_6.expected_typescript.ts` |
| Expected TS class | `case_N.expected_typescript.ts` | `case_6.expected_typescript.ts` |
| Expected Py class | `case_N.expected_python.py` | `case_6.expected_python.py` |
| Expected C++ struct | `case_N.expected_cpp.h` | `case_6.expected_cpp.h` |
| Expected C++ class | `case_N.expected_cpp.h` | `case_6.expected_cpp.h` |
| Internal suite functions | `runCaseN<Lang>Suite` (not exported) | `runCase6TsSuite`, `runCase6PySuite`, `runCase6CppSuite` |
| Exported facade function | `runCaseNSuite` | `runCase6Suite` |
| Suite name | `"Case N"` | `"Case 6"` |

## Tips

- Start with the simplest schema that reproduces the bug
- **Always check if the same bug exists in other transpilers** — if you find it in TypeScript, check Python and C++ too
- The `createGenericTestSuite` helper tests both struct and class modes automatically
- Look at existing cases in `test/test_issues/no_id/1/` through `6/` for reference patterns
- When a bug involves generics, use `createGenericType` and `useGenericType` in the case file
- For core bugs (`src/core/` or `src/lib/`), you MUST create expected output for ALL three languages
- For transpiler-specific bugs, still check the other transpilers for the same pattern — document your findings in the case file comment

## Backfilling When a New Language Is Added

When a new transpiler is added to zod-to-x:
1. Review ALL existing issue test cases in `test/test_issues/`
2. For each case, determine if the bug scenario applies to the new language
3. If it does, add expected output files for the new language in `struct-expected/` and `class-expected/`
4. Update the test suite to include the new transpiler
5. Run `npm run build && npm test` to verify
