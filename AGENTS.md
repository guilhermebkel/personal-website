# guilherr.me (personal-website)

Static personal site of Guilherme Mota: a home in five sections (intro, projects, posts, quotes, contact), a blog and a 404, in one dark theme. It exposes his work; it is not a portfolio storefront. Vocabulary is in `GLOSSARY.md`; decisions are in `docs/adr/`. The harness follows `tocomevidencia` (ADR 0002), cut to what a static site needs.

## Layout

- `app/`: routes, pages and layouts (Next.js App Router, static export to `out/`).
- `components/`: UI components, one per file (or a folder with `index.tsx` when it has parts), named by what they show.
- `src/`: logic with no UI. Every file in a mapped folder ends its name with the folder's name, singular (`PostService.ts`). Layers, low to high: `Protocols` (types only) < `Schemas` (Zod) < `Utils` (static helpers) < `Services` (dependencies through the constructor) < `Factories` (wiring) < `app/`.
- `content/posts/`: one Markdown file per post, with front-matter checked by `PostSchema`.
- `content/projects/`: one JSON file per project, written by the projects cron and checked by `ProjectSchema`.
- `e2e/`: Playwright tests. Unit tests sit next to the file they test (`*.test.ts`).
- `scripts/`: harness scripts (`lint`, `check-changed`, `ensure-*`) and their tests.

## Commands

    nvm use
    pnpm ensure-deps   # pnpm install when node_modules is missing or the lockfile changed
    pnpm dev
    pnpm test
    pnpm test:changed  # tests related to files changed against origin/main
    pnpm typecheck
    pnpm lint          # Oxlint and a minimal ESLint, in parallel
    pnpm lint:fix
    pnpm quality       # knip, jscpd, dpdm
    pnpm build         # static export to out/
    pnpm check:changed # what the branch changed against origin/main
    pnpm check         # everything; CI runs it split in parallel jobs

## How to act on a task

| When | Read | Run |
| --- | --- | --- |
| Starting a session | `README.md` (Development) | `nvm use`, `pnpm ensure-deps` |
| Writing or changing code | `docs/code-standards.md` | — |
| Writing or changing tests | `docs/test-standards.md` | — |
| Screen layout, tokens or motion | `docs/design-system.md` | — |
| Writing a post or changing the content format | `docs/content.md` | `pnpm test` |
| Before committing | `docs/code-standards.md` ("Before committing"), `.github/PULL_REQUEST_TEMPLATE.md` | `pnpm check:changed` |
| Full verification (CI gate) | `.github/PULL_REQUEST_TEMPLATE.md` | `pnpm check` |
| Changing the harness | `docs/harness-standards.md` | `pnpm check:changed` |
| A decision with a cost | `docs/adr/` | — |

## Rules

- Commit once per task, after a clean `pnpm check:changed`; CI runs the full `pnpm check` as the gate. Never raise a limit or add an ignore to pass.
- Start new work on a branch from `main` and open a pull request. Branch names are `<type>/<short-name>` in lowercase kebab-case, where `<type>` is `feat`, `fix` or `chore`.
- Code, docs, routes and identifiers are in English. The site text is in English too (the approved prototype); change that only through an ADR.
- No hex color or size outside `app/globals.css`: everything else uses a token (`docs/design-system.md`).
- The site is static: no server code at request time, no database, no login. Anything that needs one is a new ADR first.
- Content is data checked at build: a post or project that fails its schema fails the build.
- Posts written by the AI arrive as pull requests and are merged only by the owner.
- When behavior or vocabulary changes, update `GLOSSARY.md`, the docs or an ADR in the same PR.
