# Test standards

Every rule here serves two questions: would this test fail if the code broke, and is it testing the real code?

## Where tests live

- **Next to the code.** `PostService.ts` → `PostService.test.ts`. There is no `test/` folder. End-to-end tests live in `e2e/` and run with Playwright.
- **The outer `describe` names what is tested (lint: `local/describe-target`):** `describe("PostService.listPosts()")`, then contexts inside it worded as situations.
- **Through the highest seam.** Test behavior through services; test a lower module directly only for logic with many cases.
- **Real files, not mocks.** Content tests write files into a temp directory and read them back; nothing mocks `fs`.
- **Every new behavior brings its test.** A new schema, service or content rule gets a test, including the failure case.

## Which level

Many fast unit tests, few end-to-end ones. An e2e test is allowed only if it proves a critical flow (`@critical-flow`) or checks something only a browser gives (`@needs-browser`: layout, contrast, focus order, reduced motion, accessibility with axe). Tag it with the constants in `e2e/tags.ts` (lint: `local/e2e-tag`). Everything else is a unit test. A bug found at a high level is reproduced in a lower-level test first, then fixed.

## Reliable e2e

- Run browser tests through `pnpm test:e2e` or `pnpm check`, so `scripts/ensure-playwright.mjs` can verify Chromium.
- Wait for the condition, never for time: use `expect` that retries, never `waitForTimeout` (lint: `local/no-fixed-wait`).
- No retries: `retries` stays `0` (lint: `local/no-test-retries`). A test that passes on a rerun is flaky; fix the cause.
- The e2e server serves `out/`, the static build. Run `pnpm build` first (`pnpm check` does).
- **Map a new spec for `pnpm check:changed`.** `scripts/affected-specs.mjs` maps a path prefix to the specs it can break; an empty list means none, and a path with no entry runs every spec.

## Every page: the browser matrix

`e2e/matrix.spec.ts` visits every route (`/`, `/blog/`, one post, the 404) at 1440, 768 and 390 px (`e2e/viewports.ts`) with reduced motion, and each visit must pass the same checks: axe has no violations, no horizontal scroll, exactly one `h1`, every `aria-labelledby` points to an id that exists, no console error or failed request (the 404 document's own status is the one allowed error), and the skip link moves focus to `main`. A new page joins `ROUTES` in that spec. Screen issues add only what is specific to them. Behavior of the parts lives in `e2e/navbar.spec.ts` (mobile menu) and `e2e/motion.spec.ts` (reduced motion stops every animation except the quote autoplay bar, which the spec lists).

## What a test checks

- **Name the break.** Before writing the body, name the change to the code that should make the test fail. If you can't name one, the test checks nothing. A test that fails only when a constant or a message changes is a change detector: test the behavior that depends on it.
- **Expected values come from outside the code.** Write them as literals worked out by hand from the fixture, never computed with the code under test or its constants.
- **Exact assertions (lint).** `toStrictEqual`, not `toEqual`; no `toBeDefined`, `toBeTruthy` or `toBeFalsy`; `toThrow` names the message.
- **No vacuous passes.** An assertion that something never appears passes on empty output too: first assert there was something to check.
- **One behavior per test, named by the behavior,** in the words of `GLOSSARY.md`.
- **No logic in the test body (lint).** No `if` or `try` deciding which assertion runs; cases that differ only in data are rows of `it.each`.

## Real code, doubles only at the edges

- **Run the real thing.** Real services and schemas, real files in a temp directory; do not mock this repository's own modules. If a test needs that, the seam is wrong.
- **Doubles only where the process meets the outside:** the GitHub API (recorded fixtures in the real format), the network and the clock.
- **Time is an input.** Pass timestamps in; tests never depend on the clock.
- **Production code has no test-only methods.**

## Bugs and critical flows

A bug found at a high level (e2e, a preview, a report) is first reproduced in a lower-level test, then fixed; the e2e test is not the regression test. Critical flows so far: the home links to the posts, a post opens from the list, and an unknown path shows the 404.

## Before finishing: the mutation check

Go through the code you changed and imagine the realistic mistakes: a wrong threshold, the wrong branch, a front-matter field that is missing, an empty result, an off-by-one, a date that parses as another type. Some test should fail for each. When none would, add or fix the test before committing.
