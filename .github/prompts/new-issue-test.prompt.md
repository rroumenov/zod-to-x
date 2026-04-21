---
description: Create a regression test for a bug or edge case
agent: agent
---

# New Issue Test

Create a regression test for a specific bug or edge case.

Read the skill file at `.github/skills/add-issue-test/SKILL.md` first.

## Input

The user will describe:
- **The bug:** What schema/configuration produces incorrect output
- **Expected behavior:** What the correct output should be
- **Affected transpiler(s):** Which language(s) are affected (if unsure, check ALL)

## Workflow

1. Read the add-issue-test skill for the full checklist
2. Determine the next case number in `test/test_issues/no_id/`
3. Create the minimal reproducing schema in `case_N.ts`
4. **Cross-transpiler impact analysis:** Determine if the bug affects core (all languages) or a specific transpiler. If specific, check if the same flaw exists in other transpilers.
5. Create the test suite in `case_N.test-suite.ts` using `createGenericTestSuite()` for EACH affected transpiler (TypeScript, Python, C++)
6. Write the expected output files for ALL affected languages (what the CORRECT output should be)
7. Register all suite functions in `test_noid_issues.test.ts`
8. Run `npm run build && npm test` to verify the tests FAIL (confirming the bug exists)
9. Report the test is ready for the fix to be implemented
