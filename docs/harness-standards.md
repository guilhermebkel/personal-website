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
- **Ported (lint).** Each one has failing and passing cases in `scripts/eslint-local-rules.test.mjs`, and the current code passes them all:
  - `layer-imports`: a file imports only from its own layer or a lower one; `components/`, `hooks/` and `styles/` import only `src/Utils` and `src/Protocols`; a page imports anything.
  - `class-matches-file`: a file holds one class, named like the file.
  - `verb-function-name`: a function's name starts with a verb (or is a component, PascalCase, or a hook, `use…`).
  - `schema-file`: a file in `src/Schemas/` exports a value named `…Schema`.
  - `protocol-types-only`: a file in `src/Protocols/` exports types only.
  - `error-location`: an error class lives in `src/Errors/`.
  - `comment-marker`: a line comment starts with `Why:`, `@legacy:` or a tool directive.
  - `one-component-per-file`: a component file exports one component.
- **Not ported yet (lint).** `comment-placement`, `map-name`, `known-keys`, `no-bare-string-field`, `interface-for-contracts`, `no-inferred-type` and `literal-dispatch`. Their rules in `tocomevidencia` are not in this repository, so each would be written from a guess about what it checks; port one when the agent breaks its review rule, with its failing example.
- **Not ported, by design.** The Tool rules (`tool-name`, `tool-port`, `tool-builder-only`, `no-message-content-in-logs`): this site has no tools. The docs catalog: this site has no `docs-to/` folder.
- **Component render (`pnpm visual:component`).** Ported with Vitest browser mode and the Playwright provider, the same tool as `tocomevidencia`, because the components are React and need a real browser for their hover, focus and computed styles; the throwaway render files live in `test-results/visual-renders/` and are never committed.
