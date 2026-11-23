# guilherr.me

Personal site of Guilherme Mota: a home, a blog and a 404, in one dark theme. It is a static Next.js site: posts are Markdown files and projects are JSON files written by a cron that reads GitHub.

## Development

Needs the Node version in `.nvmrc` and pnpm.

```bash
nvm use
pnpm install
pnpm dev
pnpm check   # typecheck, lint, dead code, duplication, tests, build and e2e
```

Stack: Next.js (App Router, static export), TypeScript, Zod, Vitest, Playwright. Decisions are in [`docs/adr/`](docs/adr/) and the vocabulary in [`GLOSSARY.md`](GLOSSARY.md). The harness follows the one of `tocomevidencia`.

## Writing a post

Add `content/posts/<slug>.md` with front-matter and open a pull request; see [`docs/content.md`](docs/content.md).
