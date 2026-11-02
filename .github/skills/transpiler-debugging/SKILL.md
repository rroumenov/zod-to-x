---
name: transpiler-debugging
description: |
    Debug transpilation: diagnose and fix incorrect Zod schema output, inspect the AST, and trace transpiler failures. Use when a schema is not transpiling correctly, a test fails, or current output differs from expected output. Respect diagnosis-only requests.
---

## Inputs and Outcome

Collect the schema, current output, expected output, affected language, and relevant options. Reproduce with the smallest schema before tracing the pipeline below.

The normal debug-transpilation workflow includes diagnosis, a fix, and regression tests in every affected language. If the user requests diagnosis only, report the cause and impact without modifying source or tests.

## Diagnostic Flow

### 1. Identify the Layer

The pipeline has 3 phases — identify which is broken:

```
Zod Schema → [Phase 1: AST Build] → AST Nodes → [Phase 2: Transpile] → String Output
                                                        ↑
                                              [Phase 3: Post-processing]
```

### 2. Inspect the AST

Build the AST manually and inspect it:

```typescript
import { Zod2Ast } from "../../dist";

const astNodes = Zod2Ast.build(zodSchema);
console.log(JSON.stringify(astNodes, null, 2));
```

Check:
- Is the node the correct AST type? (e.g., `ASTObject` vs `ASTDefinition`)
- Are `isOptional` / `isNullable` correctly set?
- Is `aliasOf` / `parentLayer` set for cross-layer refs?
- Are `genericTypes` and `templatesTranslation` populated for generics?
- Is `arrayDimension` correct for nested arrays?
- Does the `name` match what `.zod2x("Name")` set?

An incorrect AST points to `src/core/ast_node.ts`, `src/lib/`, or layered metadata handling. A correct AST points to the target renderer or shared dispatch in `src/core/transpiler.ts`; trace the specific method rather than assuming the bug is language-local.

### 3. Trace the Transpiler

The transpile dispatch in `src/core/transpiler.ts` calls:
- `ASTEnum` → `transpileEnum()`
- `ASTObject` → `transpileStruct()`
- `ASTUnion` → `transpileUnion()`
- `ASTIntersection` → `transpileIntersection()`
- Aliased types → `transpileAliasedType()`

For property types, `getAttributeType()` is the central dispatcher. Add logging there to see what's happening:

```typescript
// Temporary debug in transpiler.ts getAttributeType()
console.log(`getAttributeType: ${token.constructor.name}`, token);
```

### 4. Common Issues and Fixes

#### Wrong output name
- Check `.zod2x("Name")` is called on the schema
- Check `getZod2xMetadata(schema)?.typeName` is set for the schema

#### Missing import
- Check `parentFile` and `parentNamespace` are set on the AST node
- Check `addExternalTypeImport()` is being called
- Check `useImports` option is `true`

#### Optional/nullable not rendering
- Check `isOptional` and `isNullable` on the AST node
- Check the transpiler's `_transpileMember()` handles these flags
- Some languages merge optional+nullable (e.g., Python: both → `Optional[T]`)

#### Cross-layer type not extending
- Check `aliasOf` is set on the definition node
- Check `checkExtendedTypeInclusion()` returns `true`
- Check `addExtendedType()` emits the correct syntax

#### Generic type not resolving
- Check `genericTypes` array on the definition
- Check `templatesTranslation` on the object
- Verify `useGenericType()` was called correctly (check `skipLazy` if in discriminatedUnion)

#### Enum in discriminated union not linking
- Check `.zod2x(zodEnum)` was called on the literal value
- Check `parentEnum` / `parentEnumKey` on the `ASTLiteral`
- Check `isFromDiscriminatedUnion` on the `ASTEnum`

### 5. Check err-* Files

When a test fails, `testOutput()` writes the actual output to an `err-*` file in the test directory. Compare this with the expected file:

```bash
diff test/test_zod2ts/err-some_test.ts test/test_zod2ts/interface-expected/some_test.ts
```

### 6. Isolate with a Minimal Schema

Create the simplest possible schema that reproduces the issue:

```typescript
const minimal = z.object({
    field: z.string(),
}).zod2x("Minimal");

const ast = Zod2Ast.build(minimal);
const output = new Zod2Ts().transpile(ast);
console.log(output);
```

### 7. Check the Build

If behavior seems random or stale:
```bash
npm run build && npm test
```

Tests import from `dist/` — if you changed source but didn't rebuild, tests use old code.

## Where Bugs Typically Live

| Symptom | Likely Location |
|---|---|
| Wrong AST type | `src/core/ast_node.ts` |
| Wrong type string | `src/transpilers/<lang>/runner.ts` (type methods) |
| Wrong structure | `src/transpilers/<lang>/runner.ts` (transpile methods) |
| Missing metadata | `src/lib/zod_ext.ts` or `src/layered-modeling/layer.ts` |
| Wrong imports | `src/transpilers/<lang>/runner.ts` (`addImportFromFile`, `runAfter`) |
| Cross-layer issue | `src/layered-modeling/layer.ts` (decorator logic) |
| Generic resolution | `src/lib/zod_helpers.ts` (`useGenericType`) |
| Number precision | `src/utils/number_limits.ts` |

## Cross-Transpiler Impact Analysis

After finding the root cause, **always** perform this analysis:

1. **Core fix (`src/core/`, `src/lib/`, `src/layered-modeling/`):** Assess all transpilers: TypeScript, Python, C++ variants, Dart, and Go, plus applicable converters. Create regression tests for every affected output.

2. **Transpiler-specific fix (`src/transpilers/<lang>/`):** Check if the same method in other transpilers has the same flaw. Common patterns that are implemented independently in each runner:
   - `checkExtendedTypeInclusion()` — cross-layer alias handling
   - `_transpileMember()` — property rendering with optional/nullable
   - `transpileStruct()` / `transpileEnum()` / `transpileUnion()` — type declaration rendering
   - `getGenericTemplatesTranslation()` — generic parameter syntax

3. **Document the scope** in your fix: which transpilers were affected and which were checked.

## Complete the Fix

1. Identify the specific failing method. Follow [add-issue-test](../add-issue-test/SKILL.md) to create a regression test that fails for the intended reason before the fix. Cover all affected languages and supported output forms.
2. Implement the root-cause fix in every affected transpiler or shared component and confirm the regression tests pass afterward.
3. Run `npm run build && npm test`. Do not accept stale `dist/` output or merely update expected files to match a bug.
4. Remove temporary diagnostics and report the cause, affected languages, fix, regression coverage, and verification results.
