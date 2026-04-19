---
description: Verify a code change hasn't broken existing functionality
agent: agent
---

# Verify Change

Run the full verification suite after a code change.

## Workflow

1. Run `npm run build` — check for compilation errors
2. Run `npm test` — run all Vitest tests
3. If any test fails:
   - Read the `err-*` file(s) to see actual output
   - Compare with expected output
   - Determine if the test needs updating or if the code change introduced a regression
   - Report findings with specific details
4. If all tests pass, confirm success
5. Run `npm run format:check` — verify formatting is correct
6. Summarize: tests passed, formatting OK, any warnings
