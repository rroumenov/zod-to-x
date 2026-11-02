---
name: add-issue-test
description: |
    Create a new issue test or regression test for a bug or edge case in zod-to-x. Use when asked to reproduce a bug, add an issue test, or write a failing test before a fix. Covers minimal schemas, expected outputs, and all affected transpilers.
---

## Inputs and Scope

Collect the bug's schema/configuration, expected behavior, and affected transpilers. If the affected languages are unknown, check all supported transpilers.

For a test-only request, stop after confirming the intended regression failure and report that the test is ready for a fix. Do not fix production code unless requested. For a bug-fix request, continue through the optional fix steps below.

## Critical Rule: Multi-Language Coverage

Every issue test MUST include expected output files for **ALL supported transpilers** where the bug or its fix applies:
- **TypeScript** — `.expected_typescript.ts`
- **Python** — `.expected_python.py`
- **C++** — `.expected_cpp.h`
- **Dart** — `.expected_dart.dart`
- **Go** — `.expected_go.go`

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
import { extendZod, Domain, Application, Zod2XModel } from "../../../../dist";
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

const runCaseNDartSuite = createGenericTestSuite(
    "Case N",
    caseNModel,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/N",
    "dart"
);

const runCaseNGoSuite = createGenericTestSuite(
    "Case N",
    caseNModel,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/N",
    "golang"
);

// Single exported entry point for the facade
export const runCaseNSuite = () => {
    runCaseNTsSuite();
    runCaseNPySuite();
    runCaseNCppSuite();
    runCaseNDartSuite();
    runCaseNGoSuite();
};
```

Include only affected languages. `createGenericTestSuite` accepts an optional `language` parameter (`"typescript"` | `"python"` | `"cpp"` | `"dart"` | `"golang"`, defaults to `"typescript"`). Go uses `"golang"` as the selector but `expected_go.go` as the filename. The helper handles each language's supported modes — see [test utilities](../../../test/common/utils.ts).

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

**Dart** (class mode only):
- `class-expected/case_N.expected_dart.dart`

**Go** (struct mode only):
- `struct-expected/case_N.expected_go.go`

**Important:** Write what the output SHOULD be (the correct behavior), not what it currently produces.

File naming convention: `case_N.expected_<language>.<ext>` where N matches the folder number. The prefix is derived from the suite name: `"Case N"` → `case_n`.

### Determining Which Languages to Cover

| Bug location | Languages to test |
|---|---|
| `src/core/`, `src/lib/`, `src/layered-modeling/` | All applicable TS, Python, C++, Dart, and Go outputs; assess converters too |
| `src/transpilers/<lang>/` | That language; check equivalent methods in every other transpiler |
| `src/converters/` | Affected converters; use their existing test patterns rather than this language-suite helper |

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

The new test should **fail for the intended incorrect output** — a build, import, or setup failure does not confirm the bug. Report the failing assertions, covered languages, and files created. For a test-only request, stop here and report readiness for the fix; if the test unexpectedly passes, investigate rather than claiming reproduction.

### 8. Fix the Bug (Only When Requested)

Analyze the failure and fix the source code (usually in `src/transpilers/` or `src/core/`).

### 9. Verify All Tests Pass (After a Fix)

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
| Expected Dart class | `case_N.expected_dart.dart` | `case_6.expected_dart.dart` |
| Expected Go struct | `case_N.expected_go.go` | `case_6.expected_go.go` |
| Internal suite functions | `runCaseN<Lang>Suite` (not exported) | `runCase6TsSuite`, `runCase6PySuite`, `runCase6CppSuite` |
| Exported facade function | `runCaseNSuite` | `runCase6Suite` |
| Suite name | `"Case N"` | `"Case 6"` |

## Tips

- Start with the simplest schema that reproduces the bug
- **Always check if the same bug exists in other transpilers**, including Dart and Go
- The `createGenericTestSuite` helper tests supported output modes automatically
- Look at existing cases in `test/test_issues/no_id/1/` through `6/` for reference patterns
- When a bug involves generics, use `createGenericType` and `useGenericType` in the case file
- For core bugs (`src/core/` or `src/lib/`), create expected output for every affected supported language
- For transpiler-specific bugs, still check the other transpilers for the same pattern — document your findings in the case file comment

## Backfilling When a New Language Is Added

When a new transpiler is added to zod-to-x:
1. Review ALL existing issue test cases in `test/test_issues/`
2. For each case, determine if the bug scenario applies to the new language
3. If it does, add expected output files for the new language in its supported `struct-expected/` and/or `class-expected/` modes
4. Update the test suite to include the new transpiler
5. Run `npm run build && npm test` to verify
