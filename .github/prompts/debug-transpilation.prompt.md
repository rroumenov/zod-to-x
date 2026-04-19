---
description: Debug why a Zod schema isn't transpiling correctly
agent: agent
---

# Debug Transpilation

Diagnose and fix a transpilation issue.

Read the skill file at `.github/skills/transpiler-debugging/SKILL.md` first.

## Input

The user will describe:
- **Schema:** The Zod schema definition
- **Current output:** What the transpiler produces now
- **Expected output:** What it should produce
- **Language:** Which transpiler is affected

## Workflow

1. Read the transpiler-debugging skill for the diagnostic flow
2. Reproduce the issue with a minimal schema
3. Inspect the AST output from `Zod2Ast.build()` to determine if the problem is in Phase 1 (AST build) or Phase 2 (transpile)
4. If AST is correct → the bug is in `src/transpilers/<lang>/runner.ts`
5. If AST is wrong → the bug is in `src/core/ast_node.ts` or `src/lib/`
6. Identify the specific method causing the issue
7. Implement the fix
8. Create a regression test following `.github/skills/add-issue-test/SKILL.md`
9. Run `npm run build && npm test` to verify all tests pass
