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
cover: /covers/hello-world.svg # optional; a file under public/
---

Body in Markdown. Start sections at `##`; the page title is the `h1`.
```

`PostFrontMatterSchema` (`src/Schemas/PostSchema.ts`) checks the front-matter. A post that fails it fails the build. The reading time is computed from the body. A `cover` that names a file missing under `public/` fails the build. To draw one, run `node scripts/render-cover.mjs "<title>" <topic> public/covers/<slug>.svg`.

A post written by the AI pipeline is a pull request with one new file. Only the owner merges it.

## Projects

`content/projects/<name>.json`, checked by `ProjectSchema` (`src/Schemas/ProjectSchema.ts`). A project is added, removed or reordered by a pull request that changes these files (and the cover image); there is no cron (ADR 0007). The owner usually does it through the Claude skill `gerenciar-projetos-do-site-pessoal`, which lists the public repositories, proposes the fields, checks the page and opens the pull request.

```json
{
  "name": "Zerod",
  "description": "One or two plain sentences.",
  "url": "https://zerod.guilherr.me",
  "kind": "game",
  "tags": ["TypeScript", "Three.js"],
  "cover": "/projects/zerod.png",
  "order": 1,
  "updatedAt": "2026-11-23T00:00:00.000Z"
}
```

| Field   | Rule                                                                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | One of `application`, `mcp`, `skill`, `library`, `game`, `other`. Data for the owner and the skill; the card does not draw it.                                                                                          |
| `tags`  | Up to three stack tags shown on the card; empty is fine. Reuse the spelling of the other projects.                                                                                                                      |
| `cover` | Optional path of a file under `public/` (`/projects/<name>.png`, about 1200 px wide, up to 250 KB; the card crops it with `object-cover`). A missing file fails the build. Without it the card draws the generated art. |
| `order` | Optional positive integer. The Projects section lists lower numbers first; projects without `order` come after the ordered ones, most recently updated first.                                                           |
| `url`   | The project's own site when it has one, otherwise its GitHub address. Only public repositories.                                                                                                                         |

A file that fails the schema fails the build.
