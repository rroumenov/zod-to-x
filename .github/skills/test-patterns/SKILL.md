---
name: test-patterns
description: |
    A skill for understanding and applying test patterns in zod-to-x. This includes how to structure tests, use utilities, write expected output files, and debug test failures. Use this skill when creating new tests, modifying existing ones, or analyzing test failures in the codebase.
---

## Test Infrastructure

- **Framework:** Vitest (globals mode — `describe`, `test`, `expect` available without import)
- **Config:** `vitest.config.ts` — environment: node, includes `**/*.{test,spec}.{ts,js}`
- **Command:** `npm test` (deletes `err-*` files first, then `vitest --run`)
- **Critical:** Always `npm run build` before `npm test` — tests import from `dist/`

## Test Categories

### 1. Per-Language Transpiler Tests (`test/test_zod2<lang>/`)

Structure:
```
test/test_zod2ts/
├── ts_supported_schemas.ts           # All Zod types as a single schema
├── ts_supported_schemas.layered.ts   # Same types via layered modeling
├── zod2ts.test.ts                    # Vitest test suite
├── interface-expected/               # Expected output for interface/struct mode
│   └── *.ts                          # Expected output files
└── class-expected/                   # Expected output for class mode
    └── *.ts
```

Naming varies by language:
- TypeScript: `interface-expected/` (not `struct-expected/`)
- Python: `class-expected/` only (no structs in Python)
- C++: `struct-expected/` + `class-expected/` with subdirs for `cpp11/` and `cpp17/`

### 2. Issue/Regression Tests (`test/test_issues/`)

Structure per case:
```
test/test_issues/no_id/N/
├── case_N.ts                 # Schema reproducing the bug
├── case_N.test-suite.ts      # Uses createGenericTestSuite()
├── struct-expected/
│   └── case_N.expected_typescript.ts
└── class-expected/
    └── case_N.expected_typescript.ts
```

Facade: `test/test_issues/no_id/test_noid_issues.test.ts` imports and calls all `runCaseNSuite()`.

### 3. Converter Tests

- `test/test_zod2proto3/` — Protobuf v3 output validation
- `test/test_zod2jschema_def/` — JSON Schema definitions validation

### 4. Native Language Tests

- `test/test_zod2cpp/test_cpp.sh` — Compiles and runs generated C++ code
- `test/test_zod2py/test_py.sh` — Runs generated Python code with pytest

## Key Utilities (`test/common/utils.ts`)

### `testOutput(output, expected, errPath?)`

Trims and compares strings. On failure:
- Prints colored diff (green = expected, red = actual)
- Writes actual output to `err-*` file at `errPath` if provided
- Throws to fail the test

### `createGenericTestSuite(suiteName, model, transpiler, basePath)`

Factory that returns a function registering a `describe` block with two tests:
- **"Output as Typescript Struct"** — struct/interface mode
- **"Output as Typescript Class"** — class mode

Expected file paths:
- `{basePath}/struct-expected/{suiteName_snake}.expected_typescript.ts`
- `{basePath}/class-expected/{suiteName_snake}.expected_typescript.ts`

### `getSchemas()` (from `test/common/zod_schemas.ts`)

Factory returning fresh schemas. **Always use this** — never share schema instances between tests to avoid metadata pollution.

### `modelBuilder(schema)` (from `test/common/zod_schemas.ts`)

Wraps a single schema in `z.object({ item: schema }).zod2x("ModelItem")` for testing individual types.

## Writing Expected Output Files

1. Build the AST manually or transpile with current code
2. Review the output carefully for correctness
3. Save as the expected file
4. The expected file contains ONLY the transpiled output (no imports/headers unless the transpiler emits them)

**Tip:** Run the test once, check the `err-*` file for actual output, review it, and if correct, use it as the expected file.

## Test Patterns

### Testing individual types

```typescript
test("string type", () => {
    const s = getSchemas();
    const ast = Zod2Ast.build(modelBuilder(s.zString));
    const output = new Zod2Ts().transpile(ast);
    testOutput(output, expectedString, errPath);
});
```

### Testing full schema

```typescript
test("all supported types", () => {
    const ast = Zod2Ast.build(zTsSupportedSchemas);
    const output = new Zod2Ts().transpile(ast);
    testOutput(output, expectedFullSchema, errPath);
});
```

### Testing layered modeling

```typescript
test("domain layer", () => {
    const output = domainModel.transpile(Zod2XTranspilers.Zod2Ts);
    testOutput(output, expectedDomain, errPath);
});

test("application layer with cross-references", () => {
    const output = appModel.transpile(Zod2XTranspilers.Zod2Ts);
    testOutput(output, expectedApp, errPath);  // Should include import statements
});
```

### Testing with options

```typescript
test("class mode", () => {
    const ast = Zod2Ast.build(schema);
    const output = new Zod2Ts({ outType: "class" }).transpile(ast);
    testOutput(output, expectedClass, errPath);
});
```

## Debugging Test Failures

1. Check `err-*` files for actual vs expected diff
2. Verify `npm run build` was run after source changes
3. Use `vitest --run --reporter=verbose` for detailed output
4. For a single test: `npx vitest --run -t "test name pattern"`
