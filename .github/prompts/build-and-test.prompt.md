---
description: Build the project and run all Vitest tests
agent: agent
---

# Build & Test

Run the standard build-then-test workflow for zod-to-x.

## Steps

1. Run `npm run build`
2. If build succeeds, run `npm test`
3. If any test fails, analyze the `err-*` files and report which tests failed and why
4. If all pass, confirm success with a count of passing tests
