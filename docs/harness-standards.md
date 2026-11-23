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
