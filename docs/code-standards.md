# Code standards

`pnpm lint` enforces what a tool can check; the rest is checked in review and marked **(review)**. When a rule and readability disagree, raise it in the PR instead of working around the rule.

**A rule a tool can check is a tool, not a sentence.** This repo does not carry the local ESLint rules of `tocomevidencia` yet (ADR 0002); a rule below marked **(review)** is a candidate to become a local rule the day the agent breaks it twice.

## Architecture

- **Layers (review, cycles fail `pnpm quality`).** In `src/`: `Protocols` (types only) < `Schemas` (Zod) < `Utils` (static helpers, no dependencies) < `Services` (dependencies through the constructor) < `Factories` (wiring of services) < `app/`. A layer imports only the ones below it. `components/` may import `Protocols` and `Utils`.
- **Names say the folder (review).** Every file in a mapped folder of `src/` ends its name with the folder's name, singular: `PostService.ts`, `PostSchema.ts`, `ReadingTimeUtil.ts`. Exempt: `index.ts(x)`, Next.js special files in `app/`, `components/`, `scripts/` and `e2e/`.
- **Imports use `@/` (lint).** `@/Services/PostService.ts`, never `../`. `@components/` points to `components/`.
- **Classes outside React (review).** Utils are classes with static methods only. Services are classes whose dependencies come in through the constructor. Constants of a class are `static readonly`.
- **One class per file (lint).** `max-classes-per-file`.
- **A `<Name>Protocol.ts` file holds types only (review).**
- **Content is validated at build (review).** Every file read from `content/` passes a Zod schema before it reaches a page.

## Naming

- **English everywhere in code (review).** Identifiers, routes, comments and docs. The site text is English too (ADR 0001).
- **Casing (lint).** Variables, functions and parameters `camelCase`; types and classes `PascalCase`; module-level and `static readonly` primitives `UPPER_CASE`; Zod schemas `PascalCase` ending in `Schema`.
- **Descriptive names (lint).** No single-letter identifiers; `(post) => …`, not `(p) => …`.
- **Booleans (lint).** Start with `is`, `has`, `should`, `can`, `must`, `was` or `did`; always affirmative.
- **Units.** A number with a unit carries it in the name (`readingMinutes`, `idleMs`). Points in time: ISO strings end in `At`; epoch milliseconds end in `AtMs`.

## Functions and style

- **Arrow functions (lint).** `const readPage = async (…) => { … }`. Framework entry points too: `const HomePage = …; export default HomePage;`. Class methods stay methods.
- **Formatting (lint).** Double quotes, semicolons, 2 spaces, trailing commas, lines up to 120 characters, one JSX prop per line when the tag spans lines (`@stylistic`).
- **Limits (lint).** Cognitive complexity 15, depth 3, 5 parameters; no magic numbers except -1, 0 and 1: name the constant.
- **Comments (review).** A comment says why, starting with `Why:`. Code that keeps old data from breaking carries `@legacy`.

## TypeScript

- Strict, with `noUncheckedIndexedAccess`. No `any`, no non-null assertion, no unchecked `as` (lint). Type-aware lint catches floating promises and unsafe values.
- `import type` for types. No default export except where Next.js requires it (pages, layouts, `not-found`).

## UI

- **No hex or raw size outside `app/globals.css` (review).** Use tokens (`docs/design-system.md`).
- **Server components by default (review).** Add `"use client"` only for what needs state or the browser.

## Before committing

Run `pnpm check:changed`; it runs lint, related tests, quality, typecheck and the e2e specs the change can break. Do not commit a failing check, and do not raise a limit or add an ignore to pass.
