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

`PostFrontMatterSchema` (`src/Schemas/PostSchema.ts`) checks the front-matter. A post that fails it fails the build. The reading time is computed from the body, leaving out collapsed code blocks and Mermaid diagrams, which a reader opens or looks at rather than reads. The "On this page" index lists the `##` headings of the body, never the ones inside a code block. A `cover` that names a file missing under `public/` fails the build. To draw one, run `node scripts/render-cover.mjs <slug>`; it writes `public/covers/<slug>.svg`. The cover is flat overlapping shapes (circles, half circles, rounded bars, arches, quarter tiles) with a grid, hatch or dot texture, in the token colors over the `lift` ground (lighter than the page, so the cover reads as its own block; the post and its cards add a 2px `sunken` border), with the contour lines of the site in `contour-cover-lift`, and no text. The slug is the only input: the same slug always gives the same cover. The slug picks the palette order, the texture and one of 12 compositions (`scripts/cover-compositions.mjs`; a new composition is a new entry there). The composition is never the one of the post dated just before, which the script reads from the `data-composition` attribute of that post's cover; the line it prints says `not <name>` when it could not avoid it. Every shape is moved inside x 70 to 730 and y 45 to 335 of the 800x380 canvas, the area that both the post crop (about 2.7:1) and the card crop (about 1.75:1) keep. Draw a new post's cover after its front-matter date is set, and draw the posts in date order.

Images and notes:

- `![alt](/posts/x.png "Caption")`: an image alone in its paragraph becomes a figure with the title as its caption; without a title it has no caption. A figure, a diagram and a code block share the width of the text column. An image inside a sentence renders inline, with no caption.
- `text[^1]` and `[^1]: The note.` (GFM footnotes): the note is listed at the end under "Notes". Links to a note stay in the same tab.
- A code block with `title="..."` shows that label above it, open. A code block with `collapsed` starts closed behind a control that opens it; its label is the `title`, or the language when there is no title. Both can be combined: ` ```md title="AGENTS.md" collapsed `. A plain block renders as before. The control is a native `<details>`, so it works without JavaScript.
- A ` ```mermaid ` block is a diagram: it is drawn at build time with the site's colors and shows as a figure. `alt="..."` in the info string names it for screen readers (` ```mermaid alt="Release flow" `); without it the alt is "Diagram". A block that does not parse fails the build and names the post. Diagrams are drawn by `scripts/render-diagrams.mjs` (ADR 0010) into `public/diagrams/`, which is committed: after adding or changing a diagram, run `pnpm diagrams` and commit the new SVG. `pnpm check:diagrams` fails when one is missing, and the build draws only missing ones, so the host never needs a browser. The diagram uses the site's colors and font.

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
