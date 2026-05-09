---
name: ast-system
description: |
    A skill for understanding the AST system in zod-to-x, including the type hierarchy, how `Zod2Ast.build()` works, and how transpilers dispatch on AST nodes. Use this skill when working with AST types, modifying the AST building process, or needing to understand the internal representation of Zod schemas.
---

## AST Type Hierarchy

All types extend `ASTCommon` (defined in `src/core/ast-types/ast_common.ts`):

```
ASTCommon
├── arrayDimension?: number     (multi-dimensional array depth)
├── description?: string        (from .describe() → becomes comment)
├── isNullable?: boolean        (from .nullable())
├── isOptional?: boolean        (from .optional())
├── parentFile?: string         (source file for imports)
├── parentNamespace?: string    (namespace for qualified imports)
└── aliasOf?: string            (cross-layer inheritance target)
```

### Simple Types (`src/core/ast-types/ast_simple.ts`)

| Type | Zod Source | Key Properties |
|---|---|---|
| `ASTString` | `ZodString` | `name?`, `constraints?` (min, max, regex) |
| `ASTNumber` | `ZodNumber`, `ZodBigInt` | `name?`, `constraints?` (min, max, isInt) |
| `ASTBoolean` | `ZodBoolean` | `name?` |
| `ASTLiteral` | `ZodLiteral` | `name?`, `value`, `parentEnum?`, `parentEnumKey?` |
| `ASTDate` | `ZodDate` | `name?` |
| `ASTAny` | `ZodAny` | `name?` |

### Complex Types (`src/core/ast-types/ast_complex.ts`)

| Type | Zod Source | Key Properties |
|---|---|---|
| `ASTEnum` | `ZodEnum`, `ZodNativeEnum` | `name`, `values[]`, `isFromDiscriminatedUnion?` |
| `ASTObject` | `ZodObject` | `name`, `properties: Record<string, ASTType>`, `templates`, `templatesTranslation[]` |
| `ASTUnion` | `ZodUnion`, `ZodDiscriminatedUnion` | `name`, `options[]`, `areAllObjects`, `discriminantKey?`, `newObject?` |
| `ASTIntersection` | `ZodIntersection` | `name`, `left`, `right`, `areAllObjects`, `newObject?` |
| `ASTMap` | `ZodRecord`, `ZodMap` | `name?`, `key`, `value`, `type: "record"|"map"` |
| `ASTSet` | `ZodSet` | `name?`, `value` |
| `ASTTuple` | `ZodTuple` | `name?`, `items[]` |
| `ASTArray` | `ZodArray` (named only) | `name`, `item` |

### Special Types

| Type | Purpose |
|---|---|
| `ASTDefinition` | Reference to existing named node. Has `name`, `instanceType`, `constraints?`, `templatesTranslation[]`. Avoids duplication. |
| `ASTGenericType` | Generic template parameter (`T`, `K`). Only has `name`. Used inside object properties, not in `ASTNode` union. |
| `ASTNodes` | Build output: `{ nodes: Map<string, ASTNode>, warnings: string[] }` |
| `ASTNode` | Union of all 14 concrete AST types |
| `ASTType` | `ASTNode | ASTDefinition` — any type that can appear as a property type |
| `ASTAliasedTypes` | Union of types that transpile as type aliases (6 simple + map/set/tuple/array) |

## Type Unions

```typescript
ASTNode = ASTString | ASTNumber | ASTBoolean | ASTLiteral | ASTDate | ASTAny 
        | ASTEnum | ASTObject | ASTUnion | ASTIntersection 
        | ASTMap | ASTSet | ASTTuple | ASTArray

ASTType = ASTNode | ASTDefinition

ASTAliasedTypes = ASTString | ASTNumber | ASTBoolean | ASTLiteral | ASTDate | ASTAny 
                | ASTMap | ASTSet | ASTTuple | ASTArray
```

## How `Zod2Ast.build()` Works

1. Takes a named Zod schema (must have `_zod2x.typeName`)
2. Recursively walks the schema tree
3. Converts each Zod type to its AST equivalent
4. Named sub-schemas become `ASTDefinition` references
5. Generic markers (`z.promise(z.literal("T"))`) become `ASTGenericType`
6. Layer metadata flows through to `parentFile`, `parentNamespace`, `aliasOf`

## Transpiler Dispatch

In `Zod2X.transpile()`, each node type maps to a method:

| Check | Method Called |
|---|---|
| `isTranspilerable(node)` → `ASTEnum` | `transpileEnum()` |
| `isTranspilerable(node)` → `ASTObject` | `transpileStruct()` |
| `isTranspilerable(node)` → `ASTUnion` | `transpileUnion()` |
| `isTranspilerable(node)` → `ASTIntersection` | `transpileIntersection()` |
| `isAliasedType(node)` | `transpileAliasedType()` |

Property types go through `getAttributeType()` which dispatches to the primitive/composite type methods.

## Key Patterns

### Named vs Inline Types

- **Named** (`name` property exists): Emitted as top-level declarations
- **Inline** (no `name`): Used as property types, rendered via `getAttributeType()`
- `ASTDefinition`: Always inline — refers to a named type by reference

### Generics Flow

1. `createGenericType("T")` → `z.promise(z.literal("T"))` marker
2. `Zod2Ast.build()` recognizes the marker → creates `ASTGenericType { name: "T" }`
3. Object with generics gets `templates: Set<string>` and `templatesTranslation: { name, instanceType }[]`
4. Transpiler's `getGenericTemplatesTranslation()` renders `<T>` / `Generic[T]` / `template<typename T>`

### Discriminated Unions

1. Literal discriminator field uses `.zod2x(zodEnum)` to link to parent enum
2. AST sets `ASTLiteral.parentEnum` → `ASTDefinition` pointing to the enum
3. `ASTEnum.isFromDiscriminatedUnion = true` — enum might need special handling
4. `ASTUnion.discriminantKey` stores the discriminator field name
