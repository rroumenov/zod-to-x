---
description: Add support for a new Zod type across all transpilers
agent: agent
---

# Add Zod Type Support

Add support for a new Zod type across all existing transpilers.

Read `.github/skills/ast-system/SKILL.md` and `.github/skills/test-patterns/SKILL.md` first.

## Input

The user will specify:
- **Zod type:** The Zod schema type to add (e.g., `z.promise()`, `z.function()`)
- **Expected mapping:** How this type should map to each language

## Workflow

1. Read the AST system skill to understand where to add the new type
2. Define the new AST type in `src/core/ast-types/` (simple or complex)
3. Update `ASTNode` / `ASTType` / `ASTAliasedTypes` unions as needed
4. Add recognition in `src/core/ast_node.ts` (`Zod2Ast.build()`)
5. Add abstract method(s) in `src/core/transpiler.ts` if needed
6. Implement in ALL concrete transpilers: TypeScript, Python, C++
7. Implement in converters if applicable (Protobuf, JSON Schema)
8. Add to `test/common/zod_schemas.ts` (`getSchemas()`)
9. Add to each language's `<lang>_supported_schemas.ts`
10. Add expected output files for each language
11. Update `SUPPORTED_ZOD_TYPES.md`
12. Run `npm run build && npm test` — verify all tests pass
