# zod-to-x — Agent Instructions

## Overview

npm package that transpiles Zod schema-based data models into typed code for multiple languages (TypeScript, Python/Pydantic, C++11/C++17, Dart/json_serializable) and data formats (Protobuf v3, JSON Schema). Uses a layered modeling architecture inspired by Clean Architecture (DDD).

## Quick Reference

```bash
npm install              # Always first — Zod version depends on branch
npm run build            # Clean build: rm dist → tsc → tsc-alias
npm run build:debug      # Dev build with sourcemaps (tsconfig.dev.json)
npm test                 # Delete err-* files → vitest --run
npm run test:cpp         # Native C++ compilation tests
npm run test:py          # Native Python tests (needs venv activated)
npm run test:all         # C++ + Python native tests
npm run test:dart        # Native Dart tests (dart + build_runner required)
npm run test:go          # Native Go tests (Go toolchain required)
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
| `src/transpilers/` | Concrete transpilers: `typescript/`, `python/`, `cpp/`, `dart/`, `go/` |
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
| **Generics** | Optional: `genericTemplatesBrackets` (default `<`, `>`). `getGenericTemplatesTranslation()` is implemented in `Zod2X` |
| **Layered** | `addExtendedType()`. Optional: `getExtendedTypeOptions()` (language options for `addExtendedType`). `checkExtendedTypeInclusion()` is implemented in `Zod2X` |
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

Metadata is not injected into schemas: it lives in a `WeakMap` keyed by schema instance (`src/lib/zod2x_metadata.ts`), read with `getZod2xMetadata(schema)` and written with `setZod2xMetadata(schema, meta)`. Only user information is stored: `typeName` (set with `zod2x`), `parentEnum` and `genericOf` (generic schema and template values set by `useGenericType`). Layered information (`layer`, `aliasOf`) is never stored: `src/layered-modeling/resolver.ts` resolves it from the types declared by all created models and provides it through the default lookup of `resolveZod2xMetadata` (`setLayeredMetadataLookup`). Derived information (`parentLayer`, alias type name, `genericTypes`, `isGenericChild`, ...) is computed when needed by `resolveZod2xMetadata(schema)`, so it is always up to date. Zod 3 copies the definition of a schema for every change, and schemas are never modified (Zod prototypes neither). Copies that only change cosmetic keys (`.describe()`, `.strict()`, `.passthrough()`, `.catchall()`) inherit the metadata of their source, as a whole (it is not merged); copies that change the type (`.extend()`, `.omit()`, `.pick()`, ...) do not. Copies are found by `getCopySource`: schemas created by zod-to-x (`zod2x` copies, handles, generic instances) reference themselves in their definition under a symbol key that Zod copies (`linkCopies`, `linkToSource`); copies of user schemas with metadata or declared by layered models (`registerCopySource`) are found by structure (same definition members except cosmetic ones) for objects, enums, unions, intersections and basic types with checks. The first registered schema of a structure is the source of the copies of all of them, except of the schemas it is itself linked to, so copy sources never form a cycle. Copies of other kinds (arrays, optionals, literals, ...) cannot be told apart from equal schemas, so the resolver only matches them with the schemas declared by the same model, when they differ in their documentation (`isDescribedCopy`), and models use their property for them (`substitute`).

### ZodHelpers

Uses `_def.typeName` strings (not `instanceof`) for Bun compatibility.

### Branches

- `main` — Zod 4 (npm `latest`)
- `main_v1` — Zod 3 (npm `latestV1`)

Work on short-lived branches and PR (or push) to these. No `dev` branches.

### Commits & releases

Commit subjects (PR title when squash-merging) use Conventional Commits: `fix:` → patch,
`feat:` → minor, `type!:` / `BREAKING CHANGE:` → major; `chore/docs/test/ci/refactor/...` → no release.
No changeset files are written by hand. Merging does not release anything.
Releases are manual: run the "Release" workflow (`.github/workflows/release.yml`) from the
Actions tab on `main` or `main_v1`. It runs `scripts/commits-to-changesets.mjs` (changesets from
the commits since the last `chore(release)` commit), then `changeset version`, pushes a
`chore(release): vX.Y.Z` commit + `vX.Y.Z` tag, runs `npm publish` (`latest` on `main`,
`latestV1` on `main_v1`) and publishes the GitHub release.

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
- `struct-expected/` and `class-expected/` — expected output files per language

The facade `test_noid_issues.test.ts` imports and calls all `runCaseNSuite()`.

**Cross-language coverage rule:** Every issue test MUST include expected output files for ALL supported transpilers where the bug or its fix applies. Currently: TypeScript (`.expected_typescript.ts`), Python (`.expected_python.py`), C++ (`.expected_cpp.h`), Dart (`.expected_dart.dart`), Go (`.expected_go.go`). If a bug is in `src/core/` (AST or base transpiler), it likely affects all languages. If a bug is in a specific transpiler, check whether other transpilers have the same problem.

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

## Cross-Transpiler Impact Analysis

When investigating or fixing a bug:

1. **Determine the scope:** Is the fix in `src/core/` (affects all languages) or `src/transpilers/<lang>/` (language-specific)?
2. **Core fixes propagate:** A change in `ast_node.ts`, `transpiler.ts`, or `zod_helpers.ts` can affect TypeScript, Python, C++ variants, Dart, and Go output. Test all affected languages and assess converters too.
3. **Transpiler-specific fixes may repeat:** If a transpiler has a bug in `transpileStruct()` or `_transpileMember()`, check if the equivalent method in other transpilers has the same flaw. Patterns like `getExtendedTypeOptions` and `_transpileMember` are implemented independently in each runner (`checkExtendedTypeInclusion` and `getGenericTemplatesTranslation` are shared in `Zod2X`).
4. **New language = backfill issue tests:** When adding a new transpiler, review ALL existing issue test cases and add expected output files for the new language where the bug scenario applies.

## Common Pitfalls

1. **Forgetting to build** — `npm run build` before `npm test`, always
2. **Metadata pollution** — Use `getSchemas()` factory in tests; never share schema instances
3. **`z.lazy()` vs plain** — `z.discriminatedUnion` and `z.intersection` need plain `ZodObject`, use `useGenericType(obj, types, true)` with `skipLazy=true`
4. **Layered resolution** — The `@Layer` decorator does not modify schemas or store metadata: each transpilerable property declares a type (`declareLayerType`) and is replaced by a copy of its schema (its handle), so uses through a model property (`price = otherModel.money`) are told apart from direct uses of the schema. `zod-to-json-schema` tells schemas apart by their definition, so `zod2JsonSchemaDefinitions` points the handle of the owner of a type to the definition of its schema when it runs; copies of a type (`.describe()`, `.strict()`) are not definitions unless a model declares them, and names come from `resolveZod2xMetadata`, like in the transpilers. Owners, aliases and ties are resolved from all declarations when models are transpiled: a type belongs to the lowest layer that declares it (then the first declaration); other declarations extend it (aliases, as `aliasOf` lookup metadata). A declaration through the property of a layer alias extends that alias. A type declared by two models of the same layer in different files is a tie unless one uses it through the other one's property; ties raise an error in strict mode when either model is transpiled
5. **Decorator singleton** — Each decorated class is cached on `constructor.instance`; don't instantiate twice
6. **err-* files** — Generated on test failure, gitignored, cleaned by `npm test`
7. **Single-language issue tests** — Never test only one language. If a bug can manifest in multiple transpilers, cover all of them.
8. **Circular imports** — `Zod2XModel.transpile` checks the imports between the files of all created layered models (from their ASTs) when the transpiler's `supportsCircularImports()` is `false` (default; `true` for TypeScript interfaces and Dart, and when `useImports` is `false`). A cycle through the model's file raises an error in strict mode. New transpilers must override `supportsCircularImports()` if their output allows import cycles
9. **Layered AST caches** — Layered information depends on every created model, so it is resolved again, and `Zod2XModel` builds its AST again, when the layered generation changes (`getLayeredGeneration()`, incremented when a model is created). The files imported by each AST are cached with it, so the circular import check does not walk the ASTs again. `Zod2Ast` reads zod2x metadata only through its `resolveMetadata` option (default `resolveZod2xMetadata`): never read metadata directly in the AST builder. Caching resolved metadata per schema was measured to be slower than resolving it
10. **Unions of types of other files** — Variants declared in another file/package/namespace cannot be extended with the union: C++ declares a union without local alternatives as a type derived from the variant (nlohmann finds serializers by ADL in the namespaces of the alternatives only), and Go and Dart wrap these variants in local types (`<Union><DiscriminantValue>`). Go structs with fields of discriminated unions get an `UnmarshalJSON` method (encoding/json cannot deserialize interfaces). The discriminant of a variant is read from its schema, not from its node, which is shared by all the instances of a generic type. Issue cases with layers are built by the native tests from `test/test_zod2<lang>/issues/` (C++, Go) and `dart_test_pkg/test/case_N_test.dart` (Dart)

## Dart Transpiler Notes

The Dart transpiler (`src/transpilers/dart/`) emits `json_annotation` + `json_serializable` code.

### Key Dart-specific behaviors

- **`@JsonSerializable(genericArgumentFactories: true)`** is emitted for generic classes; their `fromJson` takes extra `fromJsonT` function parameters.
- **`@JsonKey(fromJson: fn, toJson: fn)`** is emitted for class-typed fields to prevent `json_serializable` from following typedef chains to transitively-imported types.
- **`instanceType` check** (not `instanceof`) is used to detect ASTObject vs ASTEnum for cross-file references, because cross-file refs are `ASTDefinition` nodes. `instanceType` is the static `kind` of the AST class (e.g. `ASTObject.kind`, see `getASTKind`), never `constructor.name`, which is changed by minifiers.
- **Cross-file generic typedefs** (e.g. `AdminUserEntity = GenericUserEntity<AdminUserMetadata>`) are detected in the `transpile()` pre-scan: top-level `ASTObject` nodes with `parentFile + genericOf (base generic type name) + non-empty templatesTranslation` populate `_typedefToExtendedType` and `_typedefTemplates` so `runAfter()` generates factory helpers.
- **Template functions** (`fromJsonT`/`toJsonT`) are built from the template translations by `_templateJson`: enums by their value (literals of an enum, or named templates whose `kind` is `ASTEnum.kind`), basic types by casting, classes by their factory. Never parse them from type names.
- **Discriminated unions** emit an abstract class with a dispatcher (`<union>FromJson`) and a serializer (`<union>ToJson`, which passes the template functions to generic variants); fields use both (lists, records and nullable fields through private helpers). Typedef aliases of disc unions use the functions of the entity-level union (`_discriminatedUnionDelegate`). Variants declared in another file cannot implement the union, so they are wrapped in local classes (`class AnyEventCreated implements AnyEvent { final Created value; }`).
- **Dart test package** lives at `test/test_zod2dart/dart_test_pkg/`. The `test_dart.sh` script copies files, runs `dart run build_runner build`, then `dart analyze lib/`.
- **Regenerate expected files** with `npx vite-node test_dev/generate_dart_expected.ts` after any runner change.
