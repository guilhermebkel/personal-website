# Mermaid diagrams in posts are rendered at build time

A post can draw a diagram with a `mermaid` code block, written in the post itself. The site is static (ADR 0001), so the diagram must be decided before the request: either the browser draws it from the Mermaid source at page load, or the build draws it once and the page shows a picture. The choice is between these two, and the build-time one is the only one that keeps the page free of extra JavaScript.

## Decision

- `scripts/render-diagrams.mjs` runs before `dev` and `build` (npm `pre` scripts). It reads every `mermaid` block of `content/posts/*.md`, draws it with `@mermaid-js/mermaid-cli`, and writes one SVG per block to `public/diagrams/<slug>/<hash>.svg`. The hash is of the block's source, so an edited diagram has a new address and a browser never shows an old picture. The folder is generated and ignored by git.
- The post's Markdown is rewritten before it reaches the renderer (`MermaidUtil.replaceDiagrams` in `PostService.readPost`): each block becomes an image alone in its paragraph, so it is shown as a figure like any other picture (`PostFigure`). The `alt="..."` option of the info string names it; without it the alt is "Diagram".
- The diagram uses Mermaid's `classic` look: the default `neo` look adds a light drop shadow to each shape, which reads as a white halo on the dark ground.
- The diagram is drawn with the site's tokens (`design/system/tokens.json`, `buildMermaidConfig`), on the `cover` token, the ground of a post figure, and in the site's Ubuntu. An SVG shown as a picture cannot load the page's fonts, so the Ubuntu files of `@fontsource/ubuntu` (regular and medium, latin) are embedded in each SVG as `@font-face`. Mermaid drops that rule from its own style sheet, so it is added at the root of the finished SVG (`injectFontCss`). Mermaid also sizes each box from the text width in its own page, so that page loads the Ubuntu style sheets of `@fontsource/ubuntu` too (`buildMeasureFontCss`); measured with a fallback font, the boxes were narrower than the drawn text and cut its last letters. A missing color token fails the build.
- A diagram that does not parse fails the build: the error names the post (`mermaid in post "<slug>": ...`) and the script exits with code 1.
- The browser that draws is the Chromium of Playwright, the same one the end-to-end tests use. It is installed by `pnpm ensure-playwright` only when a post has a diagram, so a build with no diagram neither downloads nor launches a browser.
- Mermaid runs in Node at build time, never on the reader's page. The page loads no script for a diagram.

## Cost

- Build time: one browser launch per run that has a diagram, and one render per diagram. A post with diagrams adds seconds to `pnpm build`; a post without them adds nothing.
- Dependencies: `@mermaid-js/mermaid-cli` (with `mermaid` and `puppeteer-core` under it). Its own Chrome download is blocked by pnpm (build scripts are not allowed), so the script uses the Playwright Chromium instead. A new Mermaid version needs a check of the rendered SVGs.
- Each SVG is about 100 KB, mostly the two embedded font files. It is an image, so it does not count against the script budget (`docs/harness-standards.md`).
- A diagram is not interactive and cannot be zoomed by Mermaid itself; the post's image zoom (`PostImage`) applies to it as to any picture.

## Not decided here

- Other diagram languages (PlantUML, Graphviz) and interactive diagrams stay out of scope (issue #81).
