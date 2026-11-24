# guilherr.me

Personal site of Guilherme Mota: a home, a blog and a 404, in one dark theme. It is a static Next.js site: posts are Markdown files and projects are JSON files; both change through pull requests.

## Development

Needs the Node version in `.nvmrc` and pnpm.

```bash
nvm use
pnpm install
pnpm dev
pnpm check   # typecheck, lint, dead code, duplication, tests, build and e2e
pnpm prototype:shots   # the approved prototype boards as PNGs in test-results/prototype/
```

The prototype boards are reference files in [`design/prototype/`](design/prototype/); `pnpm prototype:compare` (after `pnpm build`) sets each one next to the page it matches.

Stack: Next.js (App Router, static export), TypeScript, Tailwind v4 and shadcn/ui, Zod, Vitest, Playwright. The design system is in [`design/`](design/). Decisions are in [`docs/adr/`](docs/adr/) and the vocabulary in [`GLOSSARY.md`](GLOSSARY.md). The harness follows the one of `tocomevidencia`.

## Principles

- **Static.** No server code at request time, no database, no login.
- **Content is data.** A post or project that fails its schema fails the build.
- **The owner merges.** Posts written by the AI arrive as pull requests and only Guilherme merges them.

## Writing a post

Add `content/posts/<slug>.md` with front-matter and open a pull request; see [`docs/content.md`](docs/content.md).
