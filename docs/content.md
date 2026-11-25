# Content

Posts and projects are files in the repository; the build reads them and writes static pages. Nothing is read at request time.

## Posts

`content/posts/<slug>.md`, where the slug is the file name and the URL (`/blog/<slug>/`).

```md
---
title: My first post
date: 2026-11-23
updated: 2026-11-24 # optional; set it when the content changed after publishing, not for a typo
summary: One sentence the list and the metadata show.
tags: [meta]
cover: /covers/my-first-post.svg # optional; a file under public/
---

Body in Markdown. Start sections at `##`; the page title is the `h1`.
```

`updated` is optional. When it is set, the page shows `Updated <date>` after the published date, and the structured data, the feed and the sitemap use it as the last change; `updated` earlier than `date` fails the build.

`PostFrontMatterSchema` (`src/Schemas/PostSchema.ts`) checks the front-matter. A post that fails it fails the build. The reading time is computed from the body, leaving out collapsed code blocks and Mermaid diagrams, which a reader opens or looks at rather than reads. The "On this page" index lists the `##` headings of the body, never the ones inside a code block. A `cover` that names a file missing under `public/` fails the build. To draw one, run `node scripts/render-cover.mjs "<title>" <topic> public/covers/<slug>.svg`. It writes the title in two lines of up to 26 characters, in the site's embedded Ubuntu, and fails when the title does not fit, instead of cutting it.

Images and notes:

- `![alt](/posts/x.png "Caption")`: an image alone in its paragraph becomes a figure with the title as its caption; without a title it has no caption. On desktop a figure is wider than the text column. An image inside a sentence renders inline, with no caption.
- `text[^1]` and `[^1]: The note.` (GFM footnotes): the note is listed at the end under "Notes". Links to a note stay in the same tab.
- A code block with `title="..."` shows that label above it, open. A code block with `collapsed` starts closed behind a control that opens it; its label is the `title`, or the language when there is no title. Both can be combined: ` ```md title="AGENTS.md" collapsed `. A plain block renders as before. The control is a native `<details>`, so it works without JavaScript.
- A ` ```mermaid ` block is a diagram: it is drawn at build time with the site's colors and shows as a figure. `alt="..."` in the info string names it for screen readers (` ```mermaid alt="Release flow" `); without it the alt is "Diagram". A block that does not parse fails the build and names the post. Diagrams are drawn by `scripts/render-diagrams.mjs` before `pnpm dev` and `pnpm build` (ADR 0010); the pictures go to `public/diagrams/`, which git ignores. The diagram uses the site's colors and font.

A post written by the AI pipeline is a pull request with one new file. Only the owner merges it.

## Projects

`content/projects/<name>.json`, checked by `ProjectSchema` (`src/Schemas/ProjectSchema.ts`). A project is added, removed or reordered by a pull request that changes these files (and the cover image); there is no cron (ADR 0008). The owner usually does it through the Claude skill `gerenciar-projetos-do-site-pessoal`, which lists the public repositories, proposes the fields, checks the page and opens the pull request.

```json
{
  "name": "Zerod",
  "description": "One or two plain sentences.",
  "url": "https://zerod.guilherr.me",
  "kind": "game",
  "cover": "/projects/zerod.png",
  "order": 1,
  "updatedAt": "2026-11-23T00:00:00.000Z"
}
```

| Field   | Rule                                                                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | One of `application`, `mcp`, `skill`, `library`, `game`, `other`. The card shows it as a chip (Application, MCP server, Skill, Library, Game, Other).                                                                   |
| `cover` | Optional path of a file under `public/` (`/projects/<name>.png`, about 1200 px wide, up to 250 KB; the card crops it with `object-cover`). A missing file fails the build. Without it the card draws the generated art. |
| `order` | Optional positive integer. The Projects section lists lower numbers first; projects without `order` come after the ordered ones, most recently updated first.                                                           |
| `url`   | The project's own site when it has one, otherwise its GitHub address. Only public repositories.                                                                                                                         |

A file that fails the schema fails the build.
