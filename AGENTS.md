# guilherr.me (personal-website)

Static personal site of Guilherme Mota: a home in five sections (intro, projects, posts, quotes, contact), a blog and a 404, in one dark theme. It exposes his work; it is not a portfolio storefront. Vocabulary is in `GLOSSARY.md`; decisions are in `docs/adr/`. The harness follows `tocomevidencia` (ADR 0002), cut to what a static site needs.

## Layout

- `app/`: routes, pages and layouts (Next.js App Router, static export to `out/`).
- `components/`: UI components, one per file (or a folder with `index.tsx` when it has parts), named by what they show. `components/ui/` holds shadcn/ui's own files, used only through their intermediate.
- `design/`: the design as code (`design/README.md`); `design/system/` has the tokens (`tokens.json`, generated `tokens.css`) and `DESIGN.md`.
- `src/`: logic with no UI. Every file in a mapped folder ends its name with the folder's name, singular (`PostService.ts`). Layers, low to high: `Protocols` (types only) < `Schemas` (Zod) < `Utils` (static helpers) < `Services` (dependencies through the constructor) < `Factories` (wiring) < `app/`.
- `content/posts/`: one Markdown file per post, with front-matter checked by `PostSchema`.
- `content/projects/`: one JSON file per project, written by the projects cron and checked by `ProjectSchema`.
- `e2e/`: Playwright tests. Unit tests sit next to the file they test (`*.test.ts`).
- `scripts/`: harness scripts (`lint`, `check-changed`, `ensure-*`) and their tests.

## Commands

    nvm use
    pnpm ensure-deps   # pnpm install when node_modules is missing or the lockfile changed
    pnpm dev
    pnpm design:tokens # regenerate design/system/tokens.css from tokens.json
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
| Screen layout or UI behavior | `docs/ui-ux-standards.md` | — |
| Tokens, colors or motion | `design/system/DESIGN.md` | `pnpm design:tokens` |
| Text a visitor reads | `docs/copy-standards.md` | — |
| Adding a shadcn control | `docs/adding-shadcn-components.md` | — |
| Change visible on screen | `docs/visual-check.md` | `pnpm build`, `pnpm test:e2e` |
| Writing a post or changing the content format | `docs/content.md` | `pnpm test` |
| Writing or moving docs under `docs/` | `docs/docs-standards.md` | — |
| Before committing | `docs/code-standards.md` ("Before committing"), `.github/PULL_REQUEST_TEMPLATE.md` | `pnpm check:changed` |
| Full verification (CI gate) | `.github/PULL_REQUEST_TEMPLATE.md` | `pnpm check` |
| Changing the harness | `docs/harness-standards.md` | `pnpm check:changed` |
| A decision with a cost | `docs/adr/` | — |

## Rules

- Commit once per task, after a clean `pnpm check:changed`; CI runs the full `pnpm check` as the gate. Never raise a limit or add an ignore to pass.
- Start new work on a branch from `main` and open a pull request. Branch names are `<type>/<short-name>` in lowercase kebab-case, where `<type>` is `feat`, `fix` or `chore`.
- Code, docs, routes and identifiers are in English. The site text is in English too (the approved prototype); change that only through an ADR.
- No hex color or size outside `design/system/tokens.json`: everything else uses a token (`design/system/DESIGN.md`). Edit `tokens.json`, run `pnpm design:tokens`, commit both files.
- The app imports shadcn controls only through their intermediate in `components/`, never from `components/ui/` (ADR 0004).
- The site is static: no server code at request time, no database, no login. Anything that needs one is a new ADR first.
- Rules that cannot fail (a content schema, who may merge a post) live in code with a test, never only in a doc.
- `process.env` is read only in `EnvUtil`; a new dependency needs a reason in the PR (`docs/code-standards.md`).
- Before exploring an area, read `GLOSSARY.md` and the ADRs that touch it; when your output contradicts an ADR, say so.
- Content is data checked at build: a post or project that fails its schema fails the build.
- Posts written by the AI arrive as pull requests and are merged only by the owner.
- When behavior or vocabulary changes, update `GLOSSARY.md`, the docs or an ADR in the same PR.
