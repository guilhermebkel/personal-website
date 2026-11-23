# Code standards

`pnpm lint` enforces what a tool can check; the rest is checked in review and marked **(review)**. When a rule and readability disagree, raise it in the PR instead of working around the rule.

**A rule a tool can check is a tool, not a sentence.** This repo carries a subset of the local ESLint rules of `tocomevidencia` in `scripts/eslint-local-rules.mjs` (ADR 0002); a rule below marked **(review)** is a candidate to become a local rule the day the agent breaks it twice.

## Architecture

- **Layers (review, cycles fail `pnpm quality`).** In `src/`: `Protocols` (types only) < `Schemas` (Zod) < `Utils` (static helpers, no dependencies) < `Services` (dependencies through the constructor) < `Factories` (wiring of services) < `app/`. A layer imports only the ones below it. `components/` may import `Protocols` and `Utils`.
- **Names say the folder (lint: `local/file-suffix`).** Every file in a mapped folder of `src/` ends its name with the folder's name, singular: `PostService.ts`, `PostSchema.ts`, `ReadingTimeUtil.ts`. Exempt: `index.ts(x)`, Next.js special files in `app/`, `components/`, `scripts/` and `e2e/`.
- **Imports use `@/` (lint).** `@/Services/PostService.ts`, never `../`. `@components/`, `@hooks/` and `@styles/` point to `components/`, `hooks/` and `styles/`.
- **Classes outside React (review).** Utils are classes with static methods only. Services are classes whose dependencies come in through the constructor. Constants of a class are `static readonly`.
- **One class per file (lint).** `max-classes-per-file`.
- **No `console` (review).** The scripts write with `process.stdout.write`; the site code logs nothing.
- **`process.env` is read in one place (review).** A class `EnvUtil` in `src/Utils/` reads and validates the environment with Zod; the cron token and anything else comes through it.
- **Unmapped values stay visible (review).** A value with no mapping (an unknown language, a missing cover) is returned as unmapped and shown as such, never dropped or guessed.
- **A `<Name>Protocol.ts` file holds types only (review).**
- **Content is validated at build (review).** Every file read from `content/` passes a Zod schema before it reaches a page.

## Naming

- **English everywhere in code (review).** Identifiers, routes, comments and docs. The site text is English too (ADR 0001).
- **Casing (lint).** Variables, functions and parameters `camelCase`; types and classes `PascalCase`; module-level and `static readonly` primitives `UPPER_CASE`; Zod schemas `PascalCase` ending in `Schema`.
- **Descriptive names (lint).** No single-letter identifiers; `(post) => …`, not `(p) => …`.
- **Booleans (lint).** Start with `is`, `has`, `should`, `can`, `must`, `was` or `did`; always affirmative.
- **Units.** A number with a unit carries it in the name (`readingMinutes`, `idleMs`). Points in time: ISO strings end in `At`; epoch milliseconds end in `AtMs`.

## Functions and style

- **Arrow functions (lint: `local/arrow-function`).** `const readPage = async (…) => { … }`. Framework entry points too: `const HomePage = …; export default HomePage;`. Class methods stay methods.
- **Formatting (lint).** Double quotes, semicolons, 2 spaces, trailing commas, lines up to 120 characters, one JSX prop per line when the tag spans lines (`@stylistic`).
- **Limits (lint).** Cognitive complexity 15, depth 3, 5 parameters; no magic numbers except -1, 0 and 1: name the constant.
- **Comments (review).** A comment says why, starting with `Why:`, on the line it explains. Code that keeps old data or an old screen shape from breaking carries `// @legacy: <what and why>`; it applies only to a change in stored content (a front-matter field, the project JSON) or in an on-screen component, and is removed when the old data is gone.

## TypeScript

- Strict, with `noUncheckedIndexedAccess`. No `any`, no non-null assertion, no unchecked `as` (lint). Type-aware lint catches floating promises and unsafe values.
- `import type` for types. No default export except where Next.js requires it (pages, layouts, `not-found`).

## UI

- **No hex or raw size outside `design/system/tokens.json` (lint: `local/tokens-only`).** Use tokens (`design/system/DESIGN.md`); no arbitrary values such as `bg-[#282828]` or `h-[52px]`.
- **One icon set (lint: `local/no-inline-svg`).** Standard icons are Lucide, used through `components/Icon.tsx`; an SVG of our own is hand-written in `components/Icons/`.
- **shadcn through the intermediate (lint).** `@components/ui/**` is imported only by the intermediate in `components/` (ADR 0004).
- **Server components by default (review).** Add `"use client"` only for what needs state or the browser.

### Components: look first, reuse, else compose

Before writing a component, in this order:

1. **Look in `https://ui.shadcn.com/docs/components`.** Search by what the control does, not by its name.
2. **If it exists, reuse it.** Install it as `docs/adding-shadcn-components.md` says into `components/ui/`, add its intermediate in `components/` and adapt it to our tokens there (ADR 0004). Do not rewrite a component that exists, and do not add a second one for the same job. A look two screens share is a variant of that component (`Button` has `primary`, `outline`, `ghost`, `link`), not a new class string.
3. **If it does not exist, write our own with the composition pattern the library uses:** a root that owns the state and renders the frame, and one small component per part, assembled by the screen as children. One folder per component: `index.tsx` is the root and calls the hook, `use<Name>.ts` holds the logic, `<Name>Context.ts` types the shared state and exports `use<Name>State()` (it throws, naming the root, when a part is used outside it), and each part has its own file named `<Name><Part>.tsx`. A leaf with no parts stays a single file. A hook or a class string used by more than one component goes to `hooks/` or `styles/`, not into a component's folder (ADR 0006).
4. **The PR says what was checked:** the library components looked at and, for a hand-made one, why none fit.

## Dependencies

- **pnpm only.** Commit `pnpm-lock.yaml`; never `package-lock.json`. The lockfile changes only with `package.json`.
- **A new runtime dependency needs a reason** in the PR description: the site ships what it imports.
- **No ignore for an unused dependency.** `knip.json` lists only packages a tool cannot see being used (a CSS `@import`); a dependency no file uses is removed.

## Before committing

Run `pnpm check:changed`; it runs the format check, lint, related tests, quality, typecheck and the e2e specs the change can break. Formatting is Prettier's job: `pnpm format` rewrites a file, and lint-staged formats each staged file on commit. Do not commit a failing check, and do not raise a limit or add an ignore to pass.
