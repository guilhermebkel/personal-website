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
- `content/projects/zerod.json` is a mock until the projects cron writes the real ones.
- Decided: no `Comments` component and no preloader.
- Prototype differences kept over the first design system: nav items Projects / Posts / About, tag as a bordered pill (`border-strong`), card hover fill `raised`, cover ground `cover`, post prose 18/30. New tokens: `line`, `text-disabled`, `pressed`, `inverted`, `text-inverted`, `raised`, `cover`, type `prose`.
- The prototype is the source of truth: components follow its boards (Intro, Projects, Posts, Quotes, Contact, Blog, Post, mobile menu, 404). Removed from the first design system because the prototype does not use them: `Trace`, `Summary`, `Quote`.

- 2026-11-23: the background contours are no longer 26 hard-coded paths. `ContourUtil.buildPaths()` generates one tile (two whole-number waves per line, so it tiles sideways; each line is also drawn one tile above and below, so it tiles down) and `ContoursIcon` repeats it as an SVG `<pattern>` over a page of any height. The home adds the `hero-glow` utility from the Intro board (no purple line).
- 2026-11-23: motion from the prototype boards is in the repo. `Reveal` (a block rises 18px and fades in when seen, with a stagger from `MotionUtil.delayFor()`), `animate-write` (the hero name and the signature are written left to right), `animate-fade-in` (navbar, the dot of the 404), `animate-draw-path` (logos, signature line, 404 curve), the marker of `Spotlight` (with a `delay`), the marker and rise/exit of `QuoteCarousel`, `ReadingProgress` (inside the navbar, only on a post) and the scroll thumb under `ProjectCarousel`. The looped 9s/14s timings of the boards are demos; the page plays each effect once, in a shorter order. Reduced motion shows the final state of all of them.

## Decisions log

- **2026-11-23: role tokens for the prototype's colors.** The boards use ten colors that had no token. They were added to `tokens.json` by role: `text-meta` (metadata and captions), `text-summary` (post summaries), `text-strong` (contact link text and the hero G, kept apart from `text`), `contour-cover`, `ring-cover`, `contour-hero`, `purple-line`, `purple-ring`, `purple-wash` and `scrim`. Metadata that was `text-muted` in code is `text-meta` now; `text-muted` stays for the introduction label.
- **Colors deliberately left out.** `#c9bdff` (the selected count of the projects filter) and `#9a9aa0` (a caption on the reference board LogoRound) are not on the site. `#000` is the stop of a gradient mask, not a color on screen. `rgba(255,255,255,0.035)`, `rgba(83,40,254,0.22)` and `rgba(83,40,254,0.35)` are two uses each on the hero's edge. They are documented as exceptions in `scripts/prototype-colors.mjs`, and `scripts/prototype-colors.test.mjs` fails on any other color in a board.
- **The artifact's `ds/guilherr-me/tokens.json` is obsolete.** It is an older snapshot (page background `#151515`, no `graphite`, `raised` or `cover`) and is not copied into the repository. The Design System artifact is synced from this file in its own issue.
- 2026-11-24: motion tokens. Durations (`hover` 250ms, `zoom` 500ms, `marker` 700ms, and the entrance durations as measured), delays (`signature`, `signature-line`, `trace-mark`, `accent`) and two easings (`out` = the prototype's `cubic-bezier(.23,1,.32,1)`, `inout` = the quote board's `cubic-bezier(.45,0,.2,1)`) are in `tokens.json`. The entrance of `fade-in` and the marker of the quote now use `out`, the prototype's easing, instead of the browser's `ease-out`. The hero delays in `app/page.tsx` stay JavaScript numbers (their order is the spec of the hero) and are not yet tokens.
