# Test standards

Every rule here serves two questions: would this test fail if the code broke, and is it testing the real code?

## Where tests live

- **Next to the code.** `PostService.ts` → `PostService.test.ts`. There is no `test/` folder. End-to-end tests live in `e2e/` and run with Playwright.
- **The outer `describe` names what is tested (review):** `describe("PostService.listPosts()")`, then contexts inside it worded as situations.
- **Through the highest seam.** Test behavior through services; test a lower module directly only for logic with many cases.
- **Real files, not mocks.** Content tests write files into a temp directory and read them back; nothing mocks `fs`.
- **Every new behavior brings its test.** A new schema, service or content rule gets a test, including the failure case.

## Which level

Many fast unit tests, few end-to-end ones. An e2e test is allowed only if it proves a critical flow (`@critical-flow`) or checks something only a browser gives (`@needs-browser`: layout, contrast, focus order, reduced motion, accessibility with axe). Tag it with the constants in `e2e/tags.ts`. Everything else is a unit test. A bug found at a high level is reproduced in a lower-level test first, then fixed.

## Reliable e2e

- Run browser tests through `pnpm test:e2e` or `pnpm check`, so `scripts/ensure-playwright.mjs` can verify Chromium.
- Wait for the condition, never for time: use `expect` that retries, never `waitForTimeout`.
- No retries: `retries` stays `0`. A test that passes on a rerun is flaky; fix the cause.
- The e2e server serves `out/`, the static build. Run `pnpm build` first (`pnpm check` does).
- **Map a new spec for `pnpm check:changed`.** `scripts/affected-specs.mjs` maps a path prefix to the specs it can break; an empty list means none, and a path with no entry runs every spec.
