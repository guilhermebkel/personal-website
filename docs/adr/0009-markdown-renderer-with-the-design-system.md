# Markdown renderer for the blog, with the design system on its elements

Posts are Markdown files (`docs/content.md`), so the page needs a renderer that turns them into React elements. The choice is between the renderers used in React projects: `react-markdown` (built on `remark`, the unified ecosystem), MDX (compiles the post to a component, so it needs a build step per post and its runtime), and HTML renderers such as `marked` or `markdown-it` that return a string, which the page would have to place with `dangerouslySetInnerHTML`.

## Decision

- Keep `react-markdown` with `remark-gfm` (tables, task lists, strikethrough). It returns React elements and never writes raw HTML unless a plugin asks, so a post cannot inject a script.
- Elements with a design system component are mapped to it: `a` is the `Link` (external addresses carry the arrow, `docs/ui-ux-standards.md`), and `h2` takes its slug id. The other elements take their classes from `PostContent`'s prose class, which reads the tokens, not the browser's default style.
- Every link in a post opens in a new tab (`target="_blank"`, with `rel="noopener noreferrer"`). `Link` opens internal addresses in a new tab as a plain anchor, because the Next link always stays in the same tab.

## Cost

- A post cannot use components or interactive pieces, because the renderer only knows the Markdown and the mapping above. A post that needs one is a new decision.
- The mapping is one list of components in `PostContent.tsx`. Each element a post starts to use (a table, an image caption) needs its class checked in the browser (`docs/visual-check.md`).
