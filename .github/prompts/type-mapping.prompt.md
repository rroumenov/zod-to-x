---
description: Analyze how a Zod type maps to each target language
agent: agent
---

# Type Mapping Analysis

Analyze how a specific Zod type or pattern maps across all target languages.

Read `.github/skills/ast-system/SKILL.md` first.

## Input

The user will provide a Zod schema or type pattern to analyze.

## Workflow

1. Build the AST for the given schema using `Zod2Ast.build()`
2. Show the resulting AST node structure
3. Transpile to each supported language: TypeScript, Python, C++
4. Show the output for each language side by side
5. If the type is also supported by converters, show Protobuf v3 output
6. Highlight any notable differences or limitations per language
7. Reference `SUPPORTED_ZOD_TYPES.md` for the official mapping table
