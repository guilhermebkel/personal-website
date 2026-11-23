# Content

Posts and projects are files in the repository; the build reads them and writes static pages. Nothing is read at request time.

## Posts

`content/posts/<slug>.md`, where the slug is the file name and the URL (`/blog/<slug>/`).

```md
---
title: Hello, world
date: 2026-11-23
summary: One sentence the list and the metadata show.
tags: [meta]
---
Body in Markdown. Start sections at `##`; the page title is the `h1`.
```

`PostFrontMatterSchema` (`src/Schemas/PostSchema.ts`) checks the front-matter. A post that fails it fails the build. The reading time is computed from the body.

A post written by the AI pipeline is a pull request with one new file. Only the owner merges it.

## Projects

`content/projects/<name>.json`, written by the projects cron, checked by `ProjectSchema`. Nobody edits these files by hand. If the cron cannot read GitHub it writes nothing and the last valid files stay.
