---
name: verify-change
description: >-
    Verify a code change or run build-and-test for zod-to-x. Use for verification,
    building and running all Vitest tests, test-failure diagnosis, and formatting
    checks. Supports full verification and an explicit build/test-only mode.
---

# Verify Change

## Modes

- **Full verification (default):** build, all Vitest tests, and formatting.
- **Build/test-only:** use when explicitly asked to build and test or to skip formatting. Same build/test checks, without the format check.

Use the repository's [package scripts](../../../package.json) and [test patterns](../test-patterns/SKILL.md). This workflow diagnoses and reports; do not fix source or rewrite expected outputs unless requested.

## Workflow

1. Run `npm run build` and inspect its exit status. If it fails, report the failure and do not run tests against stale `dist/`. Restore dependencies only when missing dependencies prevent validation.
2. If the build succeeds, run `npm test` for the complete Vitest suite. This script removes old `err-*` files before testing; inspect current failure artifacts before rerunning it.
3. For failing tests, inspect current `err-*` output files where generated, compare them with expected output, and read the assertions/logs. Identify the failed tests and likely cause; distinguish a regression from an intentional behavior change requiring review. Missing artifacts do not imply success.
4. In full mode, run `npm run format:check`, even if build/tests failed, because formatting is an independent check. Report failures; do not auto-format or update expected files.
5. Report the selected mode, build status, passing/failing/skipped test counts from the runner, formatting result (or explicitly skipped), warnings, and any unexecuted steps. Claim success only if every required check passed.

Native C++, Python, Dart, and Go checks are optional additions when relevant and toolchains are available; they are not silently required by either mode. State which checks actually ran.
