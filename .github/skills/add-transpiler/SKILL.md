---
name: add-transpiler
description: |
    A skill for creating a new language transpiler from scratch using Test-Driven Development (TDD). Use this when adding support for a new target language in zod-to-x. The skill provides a comprehensive step-by-step process, including planning type mappings, creating tests first, implementing the transpiler, and iterating until all tests pass.
---

## Prerequisites

- Understand all Zod types supported by the project → see [SUPPORTED_ZOD_TYPES.md](/SUPPORTED_ZOD_TYPES.md)
- Study how the target language handles: types, enums, unions, generics/templates, imports, optional/nullable, serialization
- Run `npm install && npm run build` to ensure clean starting state

## Step-by-Step Process

### 1. Plan the Type Mapping

Before writing any code, create a complete mapping table:

| Zod Type | Target Language Type | Notes |
|---|---|---|
| `z.string()` | ? | |
| `z.number()` (int) | ? | Consider precision (int32, int64, etc.) |
| `z.number()` (float) | ? | Consider precision (float32, float64, etc.) |
| `z.bigint()` | ? | |
| `z.boolean()` | ? | |
| `z.date()` | ? | Some languages use string ISO, others have native date |
| `z.literal()` | ? | |
| `z.enum()` | ? | How does the language define enums? |
| `z.nativeEnum()` | ? | Same as enum? |
| `z.array()` | ? | Multi-dimensional support needed |
| `z.set()` | ? | |
| `z.tuple()` | ? | |
| `z.object()` | ? | Class vs struct distinction? |
| `z.record()` / `z.map()` | ? | |
| `z.union()` | ? | Tagged unions? Variant types? |
| `z.discriminatedUnion()` | ? | |
| `z.intersection()` | ? | Multiple inheritance? Merged type? |
| `z.any()` | ? | Dynamic/generic type? |
| `z.optional()` | ? | |
| `z.nullable()` | ? | |

### 2. Create Tests First (TDD)

Create folder `test/test_zod2<lang>/`:

#### a. Schema definitions

Create `<lang>_supported_schemas.ts`:
```typescript
import { getSchemas, modelBuilder } from "../common/zod_schemas";
import { z } from "zod";

export function get<Lang>SupportedSchemas() {
    const s = getSchemas();
    return {
        stringItem: modelBuilder(s.zString),
        // ... map ALL types from getSchemas()
    };
}

export const z<Lang>SupportedSchemas = z.object(get<Lang>SupportedSchemas()).zod2x("<Lang>SupportedSchemas");
```

#### b. Layered schema definitions

Create `<lang>_supported_schemas.layered.ts` following the pattern in existing transpiler tests. Use `@Domain` and `@Application` decorators with `Zod2XModel`.

#### c. Expected output files

Create `struct-expected/` and/or `class-expected/` directories with expected output for each type. Study existing expected files in `test/test_zod2ts/` for the pattern.

#### d. Test suite

Create `zod2<lang>.test.ts`:
```typescript
import { describe, test, expect } from "vitest";
import { Zod2Ast, Zod2XTranspilers } from "../../dist";
import { testOutput } from "../common/utils";
// ... import schemas and expected outputs

describe("Zod to <Lang>", () => {
    describe("Individual types", () => {
        // Test each type individually using modelBuilder schemas
    });
    
    describe("Full schema", () => {
        // Test the complete supported schemas object
    });
    
    describe("Layered modeling", () => {
        // Test layered schemas with cross-layer references
    });
});
```

### 3. Create the Transpiler

Create folder `src/transpilers/<lang>/`:

#### a. Options (`options.ts`)

```typescript
import { IZodToXOpt } from "@/core/transpiler";

export interface IZod2<Lang>Opt extends IZodToXOpt {
    // Language-specific options
    outType?: "struct" | "class";  // if applicable
    keepKeys?: boolean;
    // ... other options
}

export const defaultOpts: Partial<IZod2<Lang>Opt> = {
    indent: 4,
    includeComments: true,
    useImports: true,
    outType: "struct",
    keepKeys: false,
};
```

#### b. Runner (`runner.ts`)

Create class extending `Zod2X<IZod2<Lang>Opt>`. Implement ALL abstract methods:

```typescript
import { Zod2X } from "@/core/transpiler";
import { IZod2<Lang>Opt, defaultOpts } from "./options";

export class Zod2<Lang> extends Zod2X<IZod2<Lang>Opt> {
    commentKey = "//";  // or "#" for Python-like

    constructor(opt?: Partial<IZod2<Lang>Opt>) {
        super({ ...defaultOpts, ...opt });
    }

    // Implement all 25 abstract methods
    // Reference: src/core/transpiler.ts for signatures
    // Examples: src/transpilers/typescript/runner.ts (simplest)
}
```

#### c. Optional: Libs (`libs.ts`)

If the language needs import/include statements:
```typescript
export function getLibs() {
    return {
        vectorType: '#include <vector>',
        // ...
    };
}
```

### 4. Register the Transpiler

Update `src/transpilers/index.ts` to export the new transpiler.
Update `src/index.ts` to include it in the `Zod2XTranspilers` namespace.
Update `src/layered-modeling/model.ts` to include the new type definition in `transpile` method.

### 5. Iterate Until Green

```bash
npm run build && npm test
```

Fix failures one at a time. Common issues:
- Missing handling for optional/nullable wrapping
- Incorrect indentation or naming convention
- Missing imports in `libs.ts`
- Cross-layer reference handling in `addExtendedType`

### 6. Backfill Existing Issue Tests

**This step is mandatory.** When a new transpiler is added:

1. Review ALL existing issue test cases in `test/test_issues/no_id/` (and `id/` if exists)
2. For each case, determine if the bug scenario applies to the new language
3. If it applies, add expected output files:
   - `struct-expected/case_N.expected_<lang>.<ext>` (if the language supports struct/interface mode)
   - `class-expected/case_N.expected_<lang>.<ext>`
4. Update each `case_N.test-suite.ts` to include a `createGenericTestSuite` call for the new transpiler
5. Update the facade `test_noid_issues.test.ts` to import and call the new suite functions
6. Run `npm run build && npm test` to verify

Most core bugs (AST, metadata, cross-layer) affect ALL languages, so expect to add expected output for most issue tests.

### 7. Native Language Tests

Create a test script `test/test_zod2<lang>/test_<lang>.sh` that:
1. Transpiles schemas to target language files
2. Compiles/runs those files to validate serialization/deserialization
3. Add corresponding npm script in `package.json`

## Reference Implementations

- **Simplest:** `src/transpilers/typescript/` — no libs, no serializers
- **Medium:** `src/transpilers/python/` — Pydantic framework, import consolidation
- **Complex:** `src/transpilers/cpp/` — STL/Boost, serializers, C++11/17 variants

## Key Patterns to Follow

1. **`checkExtendedTypeInclusion`** — Every `transpileX` method should check for cross-layer aliases first
2. **`_transpileMember`** — Private method for rendering a single property with optional/nullable handling
3. **`getAttributeType`** — Inherited from `Zod2X`, dispatches to your type methods. Don't override unless necessary.
4. **Output naming** — Use `case` library or manual conversion to match target language conventions (snake_case, camelCase, etc.)
