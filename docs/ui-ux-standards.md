# UI and UX standards

How the interface looks and behaves, on every screen. Read this file before a task that changes a screen. Each rule is one line a reviewer can answer with yes or no. Rules marked **(lint)** fail `pnpm lint`, **(test)** fail `pnpm test`, **(e2e)** fail `pnpm test:e2e`; **(review)** rules are checked in the PR, with the screenshots described in `docs/visual-check.md`. "Partly" means the tool checks what can be measured and the review checks the rest.

**A rule that a tool can check is a tool, not a sentence** (`docs/code-standards.md`). A review rule that keeps being broken is the next one to become a tool. The origin of the rules is in `docs/adr/0005-ui-ux-standards.md`.

Sizes are CSS pixels. "Phone" is the 390x844 viewport and "desktop" is 1280x800, the sizes the checks use.

## Navigation and layout

- **Phone first (e2e, partly).** Every page works at 390 px wide with no horizontal scroll; wider layouts add columns, they do not fix a broken phone view.
- **Both sizes are checked (review).** A PR that changes layout has a screenshot at phone and desktop size (`docs/visual-check.md`).
- **Long text never breaks the layout (review).** Titles wrap or truncate with the full text available, and flex or grid children that hold text have `min-w-0`.
- **Reading width is bounded (review).** Running text stays under about 80 characters per line.
- **Safe areas are respected (review).** Fixed bars pad with `env(safe-area-inset-*)`.
- **Content that arrives late causes no layout shift (review).** Images have a width and height, and anything loaded after the page takes reserved space.

## States

- **Every area has the states it can be in (review).** A list shows empty and filled; anything that loads also shows loading and error. A screenshot of a new state is part of the PR.
- **An empty state says what goes there (review).** "Projects will show up here." beats a blank area.
- **An error says what failed and gives a way out (review).** A link back, a retry or the next step; never a dead end or a raw code.
- **The 404 stays inside the site (e2e).** It has the site's voice, the header and a way back.
- **A link that leaves the site says so (review).** External links carry the arrow icon and open in the same tab.

## Content and tone

- **One language in everything the reader sees (review).** Labels, `aria-label`, `title`, errors and page titles are in English, with `<html lang="en">`. Wording follows `docs/copy-standards.md`.
- **Links and buttons say what happens (review).** A verb and its object ("Read the posts"), never "click here" or a bare "More".
- **Plain, short sentences (review).** One idea per sentence, sentence case, no filler.

## Accessibility

- **Text contrast is at least 4.5:1, large text and icons 3:1 (e2e).** axe checks each page type against the tokens.
- **Focus is always visible (test, partly).** `:focus-visible` draws the purple outline from `app/globals.css`, and the file never removes an outline (`scripts/globals-css-check.mjs`); a component that removes the outline shows focus another way.
- **Everything works by keyboard (e2e, partly).** Tab order follows the visual order (review); a skip link is the first focusable element and leads to `main` (e2e).
- **Native elements first (lint).** No `div` or `span` with a click handler, no links that are not links, no roles a native element already gives (`jsx-a11y`).
- **Every control has a name (lint, e2e).** Buttons and links have text or an `aria-label`, images have `alt`, links never say "link" or "here".
- **Decorative icons are hidden (lint, partly).** `components/Icon.tsx` renders `aria-hidden="true"`; the text around it carries the meaning.
- **Color never carries meaning alone (review).** A state has a word or an icon besides its color.
- **Touch targets are at least 44x44 px on phones and 24x24 px on desktop (e2e, partly).** Links inside a sentence are exempt.
- **Zoom is never disabled (review).** No `maximum-scale` or `user-scalable=no` in the viewport.
- **Reduced motion is honored (test).** The global stylesheet turns animations and transitions off under `prefers-reduced-motion` (`scripts/globals-css-check.mjs`).
- **Landmarks and headings describe the page (e2e, partly).** One `main`; one `h1` per page; headings in order (review).

## Motion

- **Motion shows what changed (review).** Opening, closing, new content arriving; never decoration on every card.
- **Animate `transform` and `opacity`, list the properties (test).** No `transition: all`, and no animating `width`, `height`, `top`, `left` or `margin` (`scripts/globals-css-check.mjs`). The exceptions (signature stroke, marker highlight) are listed in the design system.
- **Controls change state with a color transition (review).** Hover, focus-visible and pressed use the shared classes of the component.
- **Durations stay short (review).** Under 300 ms with `ease-out`, except the signature stroke.

## Consistency

- **Tokens only (lint).** Colors, type sizes, radii and the layout widths come from `design/system/tokens.json` (`bg-surface`, `rounded-md`, `text-body`). No color is written in a class and no size is an arbitrary value (`h-[52px]`, `text-[1.25rem]`): `local/tokens-only`. A value the theme lacks becomes a token first (`design/system/DESIGN.md`).
- **A new control starts from the library component (review).** Look in `https://ui.shadcn.com/docs/components` first, install it as `docs/adding-shadcn-components.md` says, and adapt it in its intermediate.
- **Shared classes live in one place (review).** A look two components share is a variant of the library component (the `Button` variants) or a `*Classes.ts` file beside them.
- **One icon set (lint).** Standard icons come from Lucide through `components/Icon.tsx`; an SVG is hand-written only for an icon of our own, in `components/Icons/` (`local/no-inline-svg`).
- **Dark only (review).** A component never picks a color per theme; there is one theme.
- **Matches the prototype when there is one (review).** The screen is compared side by side as `docs/visual-check.md` describes.

## How the rules are enforced

- **`pnpm lint`:** `jsx-a11y` strict (`.oxlintrc.json`) and the local rules `local/tokens-only` and `local/no-inline-svg` (`scripts/eslint-local-rules.mjs`, each with a failing example in its test).
- **`pnpm test`:** `scripts/globals-css-check.mjs` checks that `globals.css` holds no screen class, no raw color, no removed outline, a `:focus-visible` ring and the reduced-motion reset, and no `transition: all`.
- **`pnpm test:e2e`:** axe on each page type, the skip link, and no horizontal scroll at 390 px.
- **Everything marked review** is checked in the PR against the screenshots from `docs/visual-check.md`.
