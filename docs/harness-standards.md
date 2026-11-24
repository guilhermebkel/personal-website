# Harness standards

The harness is `AGENTS.md`, the standards docs, lint rules, check scripts, `package.json` commands and the pull request template. It was copied from `tocomevidencia` and cut to what a static site needs (ADR 0002).

**A tool before a sentence (review).** A new pattern is enforced by a type, a lint rule or a script first; it becomes a line of text only when no tool can express it.

- **Placement order (review).** Take the first that can express the rule: a type or compiler option; a lint rule; a script or test that `pnpm check` runs; a template or checklist; a line in `AGENTS.md` or a standards doc marked **(review)**; an ADR when it is a decision with a cost.
- **Cheapest adequate fix (review).** Delete or tighten before adding. Rarely needed detail stays out of `AGENTS.md`.
- **Conflict is a finding (review).** Two rules for the same thing are fixed by keeping the one where the work is done; a piece that works only because another says something specific is coupling, and also a finding.

## Classes and where the fix goes

Each finding is exactly one class; the class picks the fix.

| Class               | When                                                                                                                                                                         | Fix                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Rule ignored        | The harness already says it and the agent still does the opposite                                                                                                            | A check; never more text                                                                       |
| Partial or outdated | The rule exists but is incomplete, ambiguous or false today                                                                                                                  | Fix the line where it lives                                                                    |
| Missing             | Nothing covers it                                                                                                                                                            | Add it in the piece that does the work, not in `AGENTS.md`, unless it applies to every session |
| Structure change    | A request repeats (a skill), a fixed sequence is rediscovered (a script), a piece is never used (remove it), a large always-loaded piece is needed only sometimes (split it) | Change the structure, not a longer rule                                                        |
| Out of scope        | The cause is outside the harness                                                                                                                                             | A recommendation only                                                                          |

- **A lint rule has its test.** A local rule in `scripts/eslint-local-rules.mjs` comes with a failing example in `scripts/eslint-local-rules.test.mjs`.
- **Ported (lint).** Every local rule of `tocomevidencia` that applies to a static site, as in its source, plus `layer-imports` (which the source does not have): `comment-marker`, `comment-placement`, `map-name`, `verb-function-name`, `arrow-function`, `known-keys`, `no-bare-string-field`, `schema-file`, `protocol-types-only`, `interface-for-contracts`, `no-inferred-type`, `error-location`, `literal-dispatch`, `class-matches-file`, `file-suffix`, `describe-target`, `one-component-per-file`, `tokens-only`, `no-inline-svg`, `e2e-tag`, `no-fixed-wait`, `no-test-retries`, and `layer-imports` (a file imports only from its own layer or a lower one; `components/`, `hooks/` and `styles/` import only `src/Utils` and `src/Protocols`). Each rule has its cases in `scripts/eslint-local-rules.test.mjs`. Per-folder overrides mirror the source's `.oxlintrc.json`.
- **Not ported, by design.** The Tool rules (`tool-name`, `tool-port`, `tool-builder-only`, `no-message-content-in-logs`): this site has no tools. The docs catalog: this site has no `docs-to/` folder.
- **Component render (`pnpm visual:component`).** Ported with Vitest browser mode and the Playwright provider, the same tool as `tocomevidencia`, because the components are React and need a real browser for their hover, focus and computed styles; the throwaway render files live in `test-results/visual-renders/` and are never committed.

## Built output checks

Each runs on `out/` after `pnpm build`, in CI's build job (`lint:html`, `check:links`, `check:budgets`) or the `perf` job (`perf`), and all of them run in `pnpm check`.

- **HTML: `pnpm lint:html`** runs html-validate with `.htmlvalidate.mjs` (`html-validate:recommended`). Each rule that is off or allowed says why in that file. The allowed inline properties are `animation-delay` (the entrance delay of each block) and `transform` (the progress bars); every other inline style fails.
- **Links: `pnpm check:links`** follows every `href` and `src` of `out/`. A query string is dropped, a fragment must name an id on its page, and an external address is listed but not fetched.
- **Scripts: `pnpm check:budgets`** sums the gzipped JavaScript `/` loads from `out/index.html` against `SCRIPT_BUDGET_BYTES` (210 KB, see the decision below). It also requires every `@font-face` to load woff2 first and to be a unicode-range subset.
- **Performance: `pnpm perf`** serves `out/` and runs Lighthouse (mobile and desktop) on `/`, `/blog/` and one post. Budgets: performance ≥ 0.95, accessibility = 1, best practices ≥ 0.95, SEO ≥ 0.95; on the phone profile, LCP ≤ 2000 ms, CLS ≤ 0.02, TBT ≤ 200 ms.

**Changing a budget.** A budget is raised only in a pull request that adds an ADR line here saying why and what the new value is; a check is never passed by an ignore or a larger limit.

**Decisions.**

- **2026-11-24: script budget 150 KB → 210 KB gzip.** The home page loads 195 KiB (199,918 bytes) of JavaScript: Next's runtime, React, and the page's own chunks. The owner chose to raise the budget rather than cut the JavaScript in this wave. The new limit leaves about 7% of room; reducing the JavaScript is the open follow-up, and the budget comes back down when it is done.
- **2026-11-24: TBT budget 150 ms → 200 ms (phone profile).** The owner chose to raise it. Measured on this machine over several runs of `pnpm perf`, the home and the blog read between 47 and 194 ms, so 150 failed about one run in three on noise alone. The other timing budgets (LCP 2000 ms, CLS 0.02) and the score budgets are unchanged.
