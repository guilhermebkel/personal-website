# guilherr.me design system

Tokens and components of the graphite look: one dark theme, one purple, Ubuntu. The prototype and the system were approved in the guilherr.me Design System artifact; this folder is what the code reads.

## Where things are

| What                                                  | Where                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Token source (names, values, a note of use per token) | `design/system/tokens.json`                                 |
| Generated Tailwind theme                              | `design/system/tokens.css` (do not edit; run the generator) |
| One file to import                                    | `design/system/theme.css`                                   |
| Fonts (Ubuntu, Geist Mono, Caveat)                    | `@fontsource` packages, imported in `app/layout.tsx`        |
| Components (intermediates)                            | `components/`                                               |
| Library components (shadcn/ui, untouched)             | `components/ui/`                                            |
| Variant classes of a control                          | `styles/<Name>Classes.ts` (`ButtonClasses.ts`)              |
| Class merging                                         | `src/Utils/ClassNameUtil.ts`                                |

## Regenerate the tokens

    pnpm design:tokens

Edit `tokens.json`, run the generator, commit both files. `scripts/build-design-tokens.test.mjs` fails when `tokens.css` is out of step with `tokens.json`.

## Turn it on

`app/globals.css` imports the theme after Tailwind's own layers:

    @import "../design/system/theme.css";

The theme resets Tailwind's default colors, text sizes and radii (`--color-*: initial`), so only the design system's names exist as classes: `bg-graphite`, `text-text-soft`, `border-border-strong`, `text-body`, `rounded-md`. A shadcn class such as `bg-primary` paints nothing, on purpose.

## Rules we follow

- **Tokens by role.** Components use `text-text-muted` and `bg-surface`, never a hex or an arbitrary value (`bg-[#282828]`).
- **Same names in code and in the artifact.** A token has one name; the Tailwind class is that name (`--color-purple-light` gives `text-purple-light`).
- **shadcn is the base, the intermediate is the API.** A control in `components/ui/` is registry output. The app imports only the intermediate in `components/`, which passes `variant={null}` and adds our classes (ADR 0004).
- **Class names are written out whole.** Tailwind reads the source text; a class built at run time is never generated.
- **One dark theme.** The page ground is `graphite`, the footer band `graphite-deep`.
- **Type.** Ubuntu for text and titles, Geist Mono (provisional) for labels and metadata, Caveat only for the signature at the end of a post.
- **Motion.** Durations, delays and easings are tokens (`motion` in `tokens.json`: `--duration-*`, `--delay-*`, `--ease-*`); a number written in a class or in `globals.css` fails `globals-css-check` (`findMotionLiterals`). Only `transform` and `opacity` animate; the exceptions are the signature stroke, the trace lines (`draw-path`), the marker highlight and the progress bars, which animate their own property (`scaleX`, `background-size`, `stroke-dashoffset`). Each effect plays once. `prefers-reduced-motion` turns every animation and transition off, and the final state is shown (`app/globals.css`). The stagger step and wrap are in `motion.stagger`; `MotionUtil` reads the same values and a test checks them.
- **Accessibility.** Text contrast of 4.5:1 (3:1 for large text, control borders and icons), focus ring only from the keyboard, touch targets of 44 px. `e2e/*.spec.ts` runs axe on every page type.
- **A new token or component** is decided in the artifact first, then written here.

## Open questions

- Geist Mono is provisional, taken from the prototype.
- `content/projects/zerod.json` is a mock until the owner adds the real projects (`docs/content.md`).
- Decided: no `Comments` component and no preloader.
- Prototype differences kept over the first design system: nav items Projects / Posts / About, tag as a bordered pill (`border-strong`), card hover fill `raised`, cover ground `cover`, post prose 18/30. New tokens: `line`, `text-disabled`, `pressed`, `inverted`, `text-inverted`, `raised`, `cover`, type `prose`.
- The prototype is the source of truth: components follow its boards (Intro, Projects, Posts, Quotes, Contact, Blog, Post, mobile menu, 404). Removed from the first design system because the prototype does not use them: `Trace`, `Summary`, `Quote`.

- 2026-11-23: the background contours are no longer 26 hard-coded paths. `ContourUtil.buildPaths()` generates one tile (two whole-number waves per line, so it tiles sideways; each line is also drawn one tile above and below, so it tiles down) and `ContoursIcon` repeats it as an SVG `<pattern>` over a page of any height. The home adds the `hero-glow` utility from the Intro board (no purple line).
- 2026-11-23: motion from the prototype boards is in the repo. `Reveal` (a block rises 18px and fades in when seen, with a stagger from `MotionUtil.delayFor()`), `animate-write` (the hero name and the signature are written left to right), `animate-fade-in` (navbar, the dot of the 404), `animate-draw-path` (logos, signature line, 404 curve), the marker of `Spotlight` (with a `delay`), the marker and rise/exit of `QuoteCarousel`, `ReadingProgress` (inside the navbar, only on a post) and the scroll thumb under `ProjectCarousel`. The looped 9s/14s timings of the boards are demos; the page plays each effect once, in a shorter order. Reduced motion shows the final state of all of them.

## Controls

State matrix of every control, with the token each state uses. The intermediates are in `components/`; their classes are in `styles/`. Hover effects run only where a pointer exists (Tailwind's `hover:` is `@media (hover: hover)`; the `md:` ones also wait for 768 px). Reduced motion turns each change into its final state with no transition.

| Control                  | Rest                                                                                  | Hover                                            | Pressed                          | Focus (keyboard)                  | Disabled                                           | Selected                                         |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------- | --------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| `Button` primary         | 44 px pill, 2px `purple-light` border, transparent, `text`                            | fill `purple` (sweep), border `purple`           | fill `pressed`, label `graphite` | 2px `purple-light` ring, offset 4 | border and text `text-disabled`, no sweep          | —                                                |
| `Button` secondary       | 44 px pill, 2px `border-strong`, fill `control`, `text-soft`                          | border `purple-light`, text `text` (md+)         | —                                | 2px ring                          | border and text `text-disabled`                    | —                                                |
| `Link`                   | `text`, pad-right 8                                                                   | marker band `purple` sweeps in (md+)             | band stays                       | marker in, ring                   | `text-disabled`, no marker                         | `aria-current`: marker full                      |
| `IconButton`             | 24 px icon (44 px target below 768 px)                                                | —                                                | —                                | 2px ring, offset 4                | opacity 40%, default cursor                        | —                                                |
| `Tag` (post)             | 2px `border-strong`, `text-soft`, 12/16                                               | not interactive                                  | —                                | —                                 | —                                                  | —                                                |
| `Tag` (project)          | 2px `line`, fill `sunken`, `text-soft`, 12/16                                         | not interactive                                  | —                                | —                                 | —                                                  | —                                                |
| `ContactLink`            | 2px `border-strong`, fill `control`, 18 px `text-strong`, arrow 14 px                 | border `purple-light` (md+), arrow moves 2px     | —                                | 2px ring                          | —                                                  | —                                                |
| `SocialBar` icon         | 24 px, pill with 2px `line` (desktop 14/32, mobile 12/24 padding)                     | lifts 2px                                        | —                                | 2px ring                          | —                                                  | —                                                |
| Carousel arrow           | 48 px round, 2px `purple-light`                                                       | fill `purple` (md+)                              | —                                | 2px ring                          | border `border-strong`, icon `line`, not focusable | —                                                |
| View toggle (grid/list)  | track 3 px padding, 2px `border-strong`, fill `control`; item 38×34, icon `text-meta` | —                                                | —                                | 2px ring                          | —                                                  | item fill `purple`, icon `text` (`aria-pressed`) |
| Sort select              | 44 px pill, 2px `border-strong`, fill `control`, 16 px                                | border `purple-light` (md+)                      | —                                | 2px ring                          | —                                                  | —                                                |
| Row / card `Open` and go | 36 px pill (`Open`) or 48 px round (go), 2px `purple-light`                           | card fill `purple`, arrow moves 3px up and right | —                                | the link inside gets the ring     | —                                                  | —                                                |

Touch targets: 44 px minimum on every interactive control below 768 px. A control smaller than that (a text link, an icon, a counter) keeps its drawing and grows its hit area with padding, offset by a negative margin of the same size, so the layout does not move. The carousel arrows and the `IconButton` are 44 px themselves; the view toggle is hidden there. The whole row or card is the target for `Open`. The skip link is 1 px until it takes focus.

## Content components

Anatomy and sizes of the components the screens are made of. Each one is the board value; the sizes that have no token yet are marked and listed under Open questions.

| Component      | Parts                                                                                           | Sizes (desktop; mobile where it changes)                                         | Used by                            |
| -------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| `SectionTitle` | eyebrow (mono 14, `purple-light`), heading (56/64 medium, −0.01em)                              | top 88 (72 mobile), eyebrow to heading 16; heading 40/48 mobile                  | Projetos, Posts, Citações, Contato |
| `PostRow`      | cover 224×126 radius 16, `PostInfo`, round go 48 px                                             | padding 28/24, radius 24, side margin −24; stacked on mobile with a 150 px cover | home (Posts)                       |
| `PostCard`     | cover 200 px radius 16, `PostInfo`                                                              | padding 16, margin −16, radius 24; 150 px cover on mobile                        | Blog, Post ("Keep reading")        |
| `PostInfo`     | date line mono 12 `text-meta` (`18 Nov 2026 · 6 min read`), title, summary `text-summary`, tags | title mt 10, summary mt 8, tags mt 14 gap 8                                      | PostRow, PostCard, Post            |
| `ProjectCard`  | cover 190 px (150 mobile), body kind chip, name 24/30, description, host + `Open`               | width 384 (310 mobile), body 24/28 (20 mobile), radius 24, border 2px `sunken`   | Projetos                           |
| `Cover`        | tonal block, 9 terrain lines from the path (one purple), ring pair                              | scales to 1.03 on card hover (500 ms), still under reduced motion                | every card, the post header        |
| `Footer`       | logo 32 px, © mono 12 `text-meta`, "Back to top" 14                                             | height 96, padding 120 (20 mobile), `graphite-deep`, top border 1px `sunken`     | every page                         |

The lines of `Cover` come from `ContourUtil.buildCoverLines()` with a phase taken from the seed (`CoverUtil.phaseOf()`), so the same post always has the same lines and two posts differ.

## Open questions (Wave 3)

Decided by the owner on 2026-11-24:

- Logo corners: radius 8 is the soft corner of the mark. The paths of `design/logo/logo.svg` already have it (no vertex turns more than 11 degrees between samples), so the geometry did not change.
- Favicon and app icons are accepted: `app/favicon.ico` (32 px), `app/apple-icon.png` (180 px), `public/icon-192.png` and `public/icon-512.png`, with `app/manifest.ts`. They are drawn by `scripts/build-icons.mjs` from the logo paths and the `graphite`, `text-strong` and `purple` tokens.
- Type sizes without a token (28/34 row title, 22/28 mobile titles, 15/22 card summary and project description) use the nearest tokens (`title`, `small`, `body`).
- The project kind chip follows the ProjectCard board (12/16).

Closed in the same wave:

- Reduced motion: the hero blocks enter at once. The stagger delay is set to 0 by the reduced-motion rule in `app/globals.css`, and `e2e/motion.spec.ts` checks it.
- Focus ring: the ring is outside the control, so the ground it has to pass against is the page (`graphite`, 5.27:1) or a card (`raised`, 4.98:1); both pairs are in `contrast-pairs.json` with the `ui` role (3:1).
- The date line reads `18 Nov 2026`: `DateUtil.formatDayMonthYear()` writes the month names from a fixed list, so it does not depend on the browser language.
- Clipped ring: the project carousel is a scroll container, and it cut the top of the focus ring of a card. The track now has 4 px of room above the cards (`pt-1`, with `mt-9` so the spacing does not change), and `e2e/controls.spec.ts` checks it.
- Tab icon: the favicon (`app/icon.svg`) carries the graphite ground, because on a light browser UI the bare mark's light body disappeared. At 16 px it is legible on both grounds.

Still open:

- The ring pair of `Cover` stays at the centre; the boards move it per card.

## Decisions log

- 2026-11-24: the wave 3 pass. The control and content values of the boards are checked against the code: the arrows of the rows and the `Open` pill move 3 px (was 2), the contact arrow is 14 px, the social bar has its mobile padding and gap, the views toggle icons are `text-meta`, and the cover is the contour lines of its seed and zooms with the card. The logo viewBox has the 6-unit margin of the board, and `scripts/logo-sync.test.mjs` fails if the component and `design/logo/logo.svg` drift apart.

- **2026-11-23: role tokens for the prototype's colors.** The boards use ten colors that had no token. They were added to `tokens.json` by role: `text-meta` (metadata and captions), `text-summary` (post summaries), `text-strong` (contact link text and the hero G, kept apart from `text`), `contour-cover`, `ring-cover`, `contour-hero`, `purple-line`, `purple-ring`, `purple-wash` and `scrim`. Metadata that was `text-muted` in code is `text-meta` now; `text-muted` stays for the introduction label.
- **Colors deliberately left out.** `#c9bdff` (the selected count of the projects filter) and `#9a9aa0` (a caption on the reference board LogoRound) are not on the site. `#000` is the stop of a gradient mask, not a color on screen. `rgba(255,255,255,0.035)`, `rgba(83,40,254,0.22)` and `rgba(83,40,254,0.35)` are two uses each on the hero's edge. They are documented as exceptions in `scripts/prototype-colors.mjs`, and `scripts/prototype-colors.test.mjs` fails on any other color in a board.
- **The artifact's `ds/guilherr-me/tokens.json` is obsolete.** It is an older snapshot (page background `#151515`, no `graphite`, `raised` or `cover`) and is not copied into the repository. The Design System artifact is synced from this file in its own issue.
- 2026-11-24: motion tokens. Durations (`hover` 250ms, `zoom` 500ms, `marker` 700ms, and the entrance durations as measured), delays (`signature`, `signature-line`, `trace-mark`, `accent`) and two easings (`out` = the prototype's `cubic-bezier(.23,1,.32,1)`, `inout` = the quote board's `cubic-bezier(.45,0,.2,1)`) are in `tokens.json`. The entrance of `fade-in` and the marker of the quote now use `out`, the prototype's easing, instead of the browser's `ease-out`. The hero delays in `app/page.tsx` stay JavaScript numbers (their order is the spec of the hero) and are not yet tokens.
- 2026-11-24: wave 5, the curves. The square shapes of the site were measured against the `Curvas` board. Buttons are pills with the purple sweep from the left, cards are 24 px, project covers 16 px (`rounded-md`), tags and fields keep their radii. Links keep the approved marker: a curved purple shape (`marker-shape`) that sweeps in on hover, as the Intro and Posts boards show. A separate wave underline was not added, because it would replace a shape the owner already approved. The connector with a curved arrowhead is not used on the site: the section separators are straight rules, so the curved connector is recorded as unused rather than added.

Curve paths, from the `Curvas` board, for reference:

- Contour line of the hero: the same wave as the background tile (`hero-glow` and the contour pattern).
- Cover wave: the purple line of `CoverArtIcon` (one of nine seeded phases).
- Project cover ring: a circle of radius 53 px and an inner ring of 27 px (`CoverArtIcon`).
- Quote underline: the purple stroke under the quote's last line (`Spotlight`).
- 2026-11-24: wave 5, the design system artifact (#13). The artifact `guilherr.me design system` (Design System type, https://claude.ai/artifact/Nba6G8xrog5wVKNWqdTR72) holds the tokens (`tokens.json` in the list shape the page reads; the motion family is not on it), the brand book (`project/README.md`), the logo as an asset group, and a preview and a guideline for each of the ten components in the list above. The previews use the token values; they were rendered and checked by eye, not compared pixel by pixel with the site (that comparison is the open part of the issue). Published version: `1795514576-9254`.
- 2026-11-24: wave 5, the pixel check of the design system previews (#13 S7). Measured in the browser against the same element on the site: IconButton, Link, ContactLink, PostContent, PostInfo (height), Button, Cover and Navbar match in size and radius. PostCard differs by 28 px in height (the tag row is not drawn in the preview). PostInfo's title and Spotlight's width differ because the preview uses other text and the Caveat face is not installed in the check, so only their heights and font sizes are compared. Published version: `1795515284-23d5`.
- 2026-11-24: post reading layout (#68, #69, #70, #71, #72). The running text of a post has a measure of 40rem (`prose` container token), about 68 characters per line at the prose size on desktop; it was 720 px. Below `md` the h3 uses `text-lead` (20/28) so it is smaller than the h2 (`text-title`). A figure is widened on desktop to `figure` (50rem), into the free space beside the text. On a phone the section index is a bar under the navbar, with the current section number and title, and a list of every section numbered from 01 opens from it. A tap on a screenshot opens it full size in the native dialog. Notes of a post are the GFM footnotes, labelled "Notes".
