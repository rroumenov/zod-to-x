---
name: layered-modeling
description: |
    A skill for working with layered modeling in zod-to-x, including using decorators to define layers, creating cross-layer references, and understanding how `Zod2XModel` and `Zod2XMixin` work together. Use this skill when implementing or modifying DDD-style layered models, especially when you need to manage complex schemas with clear separation of concerns.
---

## Core Concepts

### Layer Hierarchy

```
Layer 0: Domain       — Core entities, value objects, enums
Layer 1: Application  — DTOs, use cases, derived from domain
Layer 2: Infrastructure — API models, database schemas, references app/domain
Layer 3: Presentation — View models, form schemas, references any lower layer
```

A layer can only reference types from **same or lower** layers. The decorator enforces this via `index`.

### Decorators

Defined in `src/layered-modeling/layer.ts`:

```typescript
@Domain({ file: "user_domain", namespace: "userDomain" })
@Application({ file: "user_app", namespace: "userApp" })
@Infrastructure({ file: "user_infra", namespace: "userInfra" })
@Presentation({ file: "user_ui", namespace: "userUi" })
@Layer({ file: "custom", namespace: "custom", index: 5 })  // custom layer
```

**Decorator parameters** (`IZod2xLayerMetadata`):

| Field | Type | Required | Purpose |
|---|---|---|---|
| `file` | `string` | Yes | Output filename (no extension). Used in import paths. |
| `namespace` | `string` | Yes | Namespace for qualified imports (e.g., `import * as NS from "file"`) |
| `index` | `number` | Auto | Layer ordering. Only `Layer()` requires manual index. |
| `externalInheritance` | `boolean` | No (default: `true`) | Cross-layer refs create extending types. If `false`, direct import only. |
| `basicTypes` | `boolean` | No (default: `true`) | If `false`, skip non-transpilerable types (strings, numbers as aliases). |
| `skipLayerInterface` | `boolean` | No (default: `true`) | If `true`, don't emit wrapper interface for the model class itself. |

### What the Decorator Does Internally

1. **Enforces singleton** — caches instance on `constructor.instance`
2. **Sets `modelName`** and **`layerMetadata`** on the instance
3. **Declares types** — each transpilerable own property declares a type (`declareLayerType` in `resolver.ts`): the property is replaced by a copy of its schema (its handle). Schemas are not modified and no metadata is stored. The declared schema is registered as a copy source (`registerCopySource`), so its `.strict()`-like copies are found by structure; the handle wraps its own `clone` (`linkCopies`), so copies made through the model property are linked to it
4. **Second pass** — declares `z.lazy()` properties (their getters can use the other properties)
5. **Registers the model** (`registerLayeredModel`), which increments the layered generation

The resolver (`resolver.ts`) computes the layered information from all declarations when it is needed, once per generation:
- **Owner** — a type belongs to the lowest layer that declares it, then to the first declaration. A type name set with `.zod2x()` is kept
- **Aliases** — other declarations extend the owner type when they belong to another file or have another name (`aliasOf` lookup metadata). A declaration through the property of an alias, or of a generic instance, extends that property
- **Generic instances** (`useGenericType`) declared by a model take the layer of the model if their generic type has none
- **Ties** — declarations of the same layer in different files that do not use the type through the owner's property (`getOwnershipTie`), reported by `Zod2XModel` for every declaration of the type

### Zod2XModel

Defined in `src/layered-modeling/model.ts`. Base class for all layer models.

**Key methods:**

| Method | Purpose |
|---|---|
| `getModelName()` | Returns decorator-assigned model name |
| `getLayerMetadata()` | Returns decorator-assigned layer metadata |
| `getAstNode(opt?)` | Lazy-builds and caches AST from all own Zod properties. The cache is cleared when the layered generation changes (a model is created or a type moves to another layer) |
| `transpile(target, opt?, astOpt?)` | Full transpile: build AST → check circular imports (if the transpiler does not support them) → transpile |

**Usage:**
```typescript
@Domain({ file: "user", namespace: "user" })
class UserModels extends Zod2XModel {
    userRole = z.enum(["admin", "user"]);
    userEntity = z.object({
        id: z.string(),
        role: this.userRole,
    });
}
const userModels = new UserModels();
const output = userModels.transpile(Zod2XTranspilers.Zod2Ts);
```

### Zod2XMixin

Defined in `src/layered-modeling/model_mixin.ts`. Allows splitting large models into smaller composable classes.

**Key rule:** Mixins do NOT get decorators or extend `Zod2XModel`. Only the main class does.

```typescript
class UserFields extends Zod2XMixin {
    userId = z.string();
    userName = z.string();
}

@Domain({ file: "user", namespace: "user" })
class UserModels extends Zod2XModel {
    // Use mixin properties
    userFields = new UserFields();
    
    userEntity = z.object({
        id: this.userFields.userId,
        name: this.userFields.userName,
    });
}
```

## Cross-Layer Reference Patterns

### Extending a domain type in application layer

```typescript
@Domain({ file: "domain", namespace: "domain" })
class DomainModels extends Zod2XModel {
    userEntity = z.object({ id: z.string() });
}
const domainModels = new DomainModels();

@Application({ file: "app", namespace: "app" })
class AppModels extends Zod2XModel {
    // Direct reference → creates extending/alias type with import
    createUserDto = domainModels.userEntity.omit({ id: true });
    
    // Alias reference → creates a re-export / type alias
    updateUserDto = this.createUserDto;
}
```

### Using generics across layers

```typescript
@Domain({ file: "domain", namespace: "domain" })
class DomainModels extends Zod2XModel {
    genericResponse = z.object({
        data: createGenericType("T"),
        status: z.number(),
    });
}

@Application({ file: "app", namespace: "app" })
class AppModels extends Zod2XModel {
    userResult = z.object({ name: z.string() });
    
    userResponse = useGenericType(
        domainModels.genericResponse,
        { data: this.userResult }
    );
}
```

## Transpiler Handling

When a transpiler encounters a node with `aliasOf`:

1. `checkExtendedTypeInclusion()` detects the alias
2. `addImportFromFile()` generates the import statement
3. `addExtendedType()` generates the extending type declaration

Each language renders this differently:
- **TypeScript:** `export interface X extends NS.Y {}`
- **Python:** `class X(ns.Y): ...`
- **C++:** `struct X : public ns::Y {}`
