# zod-to-x — Agent Instructions

## Overview

npm package that transpiles Zod schema-based data models into typed code for multiple languages (TypeScript, Python/Pydantic, C++11/C++17) and data formats (Protobuf v3, JSON Schema). Uses a layered modeling architecture inspired by Clean Architecture (DDD).

## Quick Reference

```bash
npm install              # Always first — Zod version depends on branch
npm run build            # Clean build: rm dist → tsc → tsc-alias
npm run build:debug      # Dev build with sourcemaps (tsconfig.dev.json)
npm test                 # Delete err-* files → vitest --run
npm run test:cpp         # Native C++ compilation tests
npm run test:py          # Native Python tests (needs venv activated)
npm run test:all         # C++ + Python native tests
npm run format:check     # Prettier check
```

**Critical rule:** Always run `npm run build` before `npm test`. Tests import from `dist/`.

## Architecture

### 3-Phase Pipeline

```
Zod Schema → Zod2Ast.build() → AST Nodes → Zod2X.transpile() → string output
```

1. **Zod Schema** — User defines data models with Zod + `.zod2x("TypeName")` metadata
2. **AST** — `Zod2Ast.build()` converts schemas into language-agnostic AST nodes
3. **Transpile** — Concrete `Zod2X<T>` subclass renders AST into target language code

### Key directories

| Directory | Purpose |
|---|---|
| `src/core/` | AST types, `Zod2Ast` builder, abstract `Zod2X` base transpiler |
| `src/core/ast-types/` | AST node interfaces: simple (string/number/bool/literal/date/any), complex (object/enum/union/intersection/map/set/tuple/array) |
| `src/transpilers/` | Concrete transpilers: `typescript/`, `python/`, `cpp/` |
| `src/converters/` | Data format converters: `protobuf_v3/`, `json_schema_definitions.ts` |
| `src/layered-modeling/` | DDD decorators (`@Domain`, `@Application`, etc.), `Zod2XModel`, `Zod2XMixin` |
| `src/lib/` | Zod extension (`zod_ext.ts`) and helpers (`zod_helpers.ts`) |
| `test/common/` | Shared schemas, test utilities (`testOutput`, `createGenericTestSuite`) |
| `test/test_zod2<lang>/` | Per-language test suites with expected output files |
| `test/test_issues/` | Regression tests for specific bugs |

### Transpiler Structure

Every transpiler has at minimum:
- **`options.ts`** — Language-specific options extending `IZodToXOpt` (base: `header`, `indent`, `includeComments`, `useImports`)
- **`runner.ts`** — Class extending `Zod2X<T>` implementing ~25 abstract methods

Optional: **`libs.ts`** — Import/include definitions (Python, C++ use this).

### Abstract Methods to Implement (grouped)

| Group | Methods |
|---|---|
| **Lifecycle** | `runBefore()`, `runAfter()` |
| **Imports** | `addImportFromFile()`, `getTypeFromExternalNamespace()` |
| **Generics** | `getGenericTemplatesTranslation()` |
| **Layered** | `addExtendedType()` |
| **Primitives** | `getStringType()`, `getBooleanType()`, `getNumberType()`, `getLiteralStringType()`, `getAnyType()`, `getDateType()` |
| **Composites** | `getTupleType()`, `getSetType()`, `getMapType()`, `getRecordType()`, `getUnionType()`, `getIntersectionType()`, `getArrayType()` |
| **Transpile** | `transpileEnum()`, `transpileStruct()`, `transpileUnion()`, `transpileIntersection()`, `transpileAliasedType()` |

## Conventions

### Naming

- **Files:** `snake_case.ts`
- **Classes:** `PascalCase` with prefixes (`AST` for AST types, `Zod2` for transpilers)
- **Properties:** `camelCase` in code; output follows target language conventions
- **Tests:** `kebab-expected/` folders, `*.test.ts` files

### Zod Extensions

- `.zod2x("TypeName")` — assigns output type name to a schema. In layered modeling its optional
- `.zod2x(zodEnum)` — on `ZodLiteral`, links to parent enum (for discriminated unions)
- `createGenericType("T")` — creates a generic type placeholder using `z.promise(z.literal("T"))` marker
- `useGenericType(obj, { slot: concreteType })` — instantiates a generic object

### Metadata

Metadata lives in `zodInstance._zod2x` with fields: `typeName`, `parentEnum`, `layer`, `aliasOf`, `parentLayer`, `genericTypes`, `isGenericChild`.

### ZodHelpers

Uses `_def.typeName` strings (not `instanceof`) for Bun compatibility.

### Branches

- `main` / `dev` — Zod 4
- `main_v1` / `dev_v1` — Zod 3

## Test Patterns

### Individual Transpiler Tests

Each `test/test_zod2<lang>/` contains:
- `<lang>_supported_schemas.ts` — all supported Zod types wrapped in a single object
- `<lang>_supported_schemas.layered.ts` — same types via layered modeling
- `zod2<lang>.test.ts` — vitest suite comparing output vs expected strings/files
- `class-expected/` and/or `struct-expected/` (or `interface-expected/`) — expected output files

### Issue Tests

Each issue in `test/test_issues/no_id/N/` contains:
- `case_N.ts` — schema definition reproducing the bug
- `case_N.test-suite.ts` — calls `createGenericTestSuite()`, exports `runCaseNSuite`
- `struct-expected/case_N.expected_typescript.ts` — expected struct/interface output
- `class-expected/case_N.expected_typescript.ts` — expected class output

The facade `test_noid_issues.test.ts` imports and calls all `runCaseNSuite()`.

### Test Utilities

- `testOutput(output, expected, errPath?)` — trims, compares, writes `err-*` on failure
- `createGenericTestSuite(name, model, transpiler, basePath)` — generates struct + class test pair
- `getSchemas()` — factory returning fresh Zod schemas (avoids metadata pollution)

## Skills & Prompts

See `.github/skills/` for detailed guidance on:
- [Adding a new transpiler](.github/skills/add-transpiler/SKILL.md)
- [Adding an issue test](.github/skills/add-issue-test/SKILL.md)
- [Debugging transpilation](.github/skills/transpiler-debugging/SKILL.md)
- [Understanding the AST system](.github/skills/ast-system/SKILL.md)
- [Layered modeling](.github/skills/layered-modeling/SKILL.md)
- [Test patterns](.github/skills/test-patterns/SKILL.md)

See `.github/prompts/` for reusable task prompts.

## Common Pitfalls

1. **Forgetting to build** — `npm run build` before `npm test`, always
2. **Metadata pollution** — Use `getSchemas()` factory in tests; never share schema instances
3. **`z.lazy()` vs plain** — `z.discriminatedUnion` and `z.intersection` need plain `ZodObject`, use `useGenericType(obj, types, true)` with `skipLazy=true`
4. **Cross-layer references** — The `@Layer` decorator clones schemas for cross-layer refs, setting `aliasOf` + `parentLayer`
5. **Decorator singleton** — Each decorated class is cached on `constructor.instance`; don't instantiate twice
6. **err-* files** — Generated on test failure, gitignored, cleaned by `npm test`
