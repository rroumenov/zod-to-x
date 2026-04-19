---
description: Create a new language transpiler from scratch following TDD
agent: agent
---

# New Transpiler

Create a new language transpiler for zod-to-x.

Read the skill file at `.github/skills/add-transpiler/SKILL.md` first.

## Input

The user will specify:
- **Target language** (e.g., Go, Rust, Java, Kotlin, Swift, etc.)
- **Serialization strategy** (native, framework-based, or none)
- **Output forms** (struct, class, or both)

## Workflow

1. Read the add-transpiler skill for the full checklist
2. Study `SUPPORTED_ZOD_TYPES.md` for all types that need mapping
3. Study the TypeScript transpiler (`src/transpilers/typescript/`) as the simplest reference
4. Plan the complete type mapping table for the target language
5. Present the plan and get confirmation before proceeding
6. Create tests first (TDD): schemas, expected outputs, test suite
7. Create the transpiler: options.ts, runner.ts, optional libs.ts
8. Register in `src/transpilers/index.ts` and `src/index.ts`
9. Iterate: `npm run build && npm test` until all green
