---
name: add-zod-type
description: >-
    Add support for a new Zod type or schema construct across the AST, transpilers,
    and applicable converters in zod-to-x. Use for add-zod-type requests and
    missing type support, including tests and the supported-types documentation.
---

# Add Zod Type Support

## Inputs

Collect the Zod type/schema construct and expected mappings for each target language. Confirm semantics or unsupported mappings when multiple interpretations are possible.

## Workflow

1. Read [ast-system](../ast-system/SKILL.md) and [test-patterns](../test-patterns/SKILL.md). Check [supported types](../../../SUPPORTED_ZOD_TYPES.md) and existing recognition/rendering logic before adding new abstractions.
2. Write failing tests first using fresh schemas from [getSchemas](../../../test/common/zod_schemas.ts). Include individual and layered supported-schema tests where applicable, plus expected outputs for each affected language and supported output form.
3. Add a simple or complex AST node in [ast-types](../../../src/core/ast-types/) if needed. Update `ASTNode`, `ASTType`, and `ASTAliasedTypes` unions as appropriate.
4. Add recognition in [the AST builder](../../../src/core/ast_node.ts). Extend [the base transpiler](../../../src/core/transpiler.ts) only if existing dispatch/methods cannot represent the type.
5. Implement mappings across all supported transpilers: TypeScript, Python, C++11/17, Dart, and Go. Assess [Protobuf and JSON Schema converters](../../../src/converters/) too. Make unsupported cases explicit using existing error conventions; do not silently substitute another type.
6. Update each affected language's supported-schema definitions, layered cases where relevant, and expected outputs. Follow [add-issue-test](../add-issue-test/SKILL.md) for a regression scenario when needed.
7. Update [SUPPORTED_ZOD_TYPES.md](../../../SUPPORTED_ZOD_TYPES.md) with the actual mappings and limitations.
8. Run `npm run build && npm test` until all tests pass. Use relevant native-language validation when available to check generated code.
9. Report the new type's mappings, limitations, affected outputs, and verification results.
