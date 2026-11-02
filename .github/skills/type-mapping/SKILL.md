---
name: type-mapping
description: >-
    Analyze how a Zod type or schema pattern maps across target languages.
    Use for type-mapping requests, AST inspection, generated-output comparisons,
    and language or converter limitations. Report only; do not implement fixes.
---

# Type Mapping Analysis

## Input and Boundary

Accept a Zod schema or type pattern and relevant options. Ask for missing semantics when necessary.

This is a reporting workflow, not an implementation request. Temporary execution and required build artifacts are allowed to inspect actual behavior, but do not make persistent changes to source, tests, expected outputs, or documentation. Remove only temporary files you created.

## Workflow

1. Read [ast-system](../ast-system/SKILL.md) and the official [supported-types table](../../../SUPPORTED_ZOD_TYPES.md).
2. Follow existing schema setup and public API patterns. Use fresh schema instances to avoid metadata pollution. Build before executing code that imports from `dist/`.
3. Build the actual AST with `Zod2Ast.build()` and show the relevant node structure, including optional/nullable flags, aliases, and generic metadata when applicable.
4. Transpile to every supported language: TypeScript, Python, C++11/17, Dart, and Go. Show comparable output snippets side by side or in clearly labeled sections, identifying options and output forms used.
5. Assess converter support. Include Protobuf v3 output when applicable; inspect JSON Schema applicability and include its result or state why it does not apply.
6. Compare differences, unsupported cases, runtime/serialization implications, and limitations against the official mapping table. Report actual errors explicitly; do not invent output or imply unsupported patterns work.
7. Summarize the schema, AST, per-target output, and mapping differences. If execution is unavailable, clearly distinguish source-based conclusions from observed output and state what remains unverified.
