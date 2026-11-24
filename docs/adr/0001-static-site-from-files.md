# The site is static and reads its content from files

## Decision

- Next.js App Router with `output: "export"`: `pnpm build` writes the site to `out/` and nothing runs on the server at request time.
- Posts are Markdown files in `content/posts/`; projects are JSON files in `content/projects/`, changed through pull requests (ADR 0008). Both are checked by Zod schemas at build.
- No database, no login, no comments service in the first version. The AI writes draft posts outside the app and opens pull requests; the owner merges.
- The site text is English, as in the approved prototype. Code and docs are English too.

## Why

The site exposes work; it has no user data. Static output costs almost nothing to host, cannot be attacked at request time and makes every change reviewable as a diff. The old site (Next 10, puppeteer thumbnails, Disqus, serverless) paid for features it did not need.

## Cost

Anything that writes at request time (own comments, forms, a view counter) is out until a new ADR. Content changes need a build and a deploy.
