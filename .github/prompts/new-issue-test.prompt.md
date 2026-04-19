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
- **Affected transpiler(s):** Which language(s) are affected

## Workflow

1. Read the add-issue-test skill for the full checklist
2. Determine the next case number in `test/test_issues/no_id/`
3. Create the minimal reproducing schema in `case_N.ts`
4. Create the test suite in `case_N.test-suite.ts` using `createGenericTestSuite()`
5. Write the expected output files (what the CORRECT output should be)
6. Register the suite in `test_noid_issues.test.ts`
7. Run `npm run build && npm test` to verify the test FAILS (confirming the bug exists)
8. Report the test is ready for the fix to be implemented
