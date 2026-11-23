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
- **Not ported yet.** The rest of the local ESLint rules of `tocomevidencia` (layers, verb names, `Why:` comments, `known-keys`, `schema-file` and the Tool rules), the docs catalog, and the isolated component render. Port one when the agent breaks the matching review rule.

## Updating dependencies

Dependabot opens the updates: npm weekly, in four groups (`next-react`, `tailwind-shadcn`, `testing`, `lint`), and GitHub Actions monthly, at most five open at a time, labelled `chore` and `area:harness`. The owner merges; nothing merges by itself.

- **What a green check shows (review).** `pnpm check` passes, the `audit` job passes (no high or critical vulnerability in production dependencies; development findings are warnings), and `.nvmrc`, `engines.node` and `packageManager` still agree (`scripts/runtime-versions.test.mjs`).
- **Major updates of Next.js or Tailwind (review).** Read the migration guide before the update, update the ADR that names the version (`docs/adr/0001` for Next.js, `docs/adr/0003` for Tailwind), and check the visual result in the browser (`docs/visual-check.md`).
- **A Node or pnpm bump (review).** Change `.nvmrc`, `engines.node` and `packageManager` in the same pull request; the runtime test fails when one is left behind.
