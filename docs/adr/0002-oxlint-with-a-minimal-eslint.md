# The harness follows tocomevidencia: Oxlint plus a minimal ESLint

## Decision

- Same lint split as `tocomevidencia` (its ADR 0022): Oxlint runs almost every rule, including the `@stylistic` and `sonarjs` JS plugins; a minimal ESLint keeps what Oxlint cannot run (`naming-convention`, `no-unnecessary-condition`, `prefer-optional-chain`). `pnpm lint` runs both in parallel through `scripts/lint.mjs`.
- Same check scripts (`check:changed`, `test:changed`, `ensure-deps`, `ensure-playwright`, `affected-specs`) and the same quality tools (Knip, jscpd, dpdm).
- Dropped on purpose: Supabase and Drizzle, the AI SDK and OpenRouter, React Email, the docs catalog and the isolated-render visual scripts, because the site has none of those. Tailwind and shadcn were dropped at first and adopted afterwards (ADR 0003 and 0004).
- Not ported yet: the 23 local ESLint rules (file suffix, layers, verb names, comment markers). The matching rules in `docs/code-standards.md` are **(review)** until they are.

## Cost

Without the local rules, folder naming and layering depend on review. Port a rule the day it is broken twice.
