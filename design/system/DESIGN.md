# guilherr.me design system

Tokens and components of the graphite look: one dark theme, one purple, Ubuntu. The prototype and the system were approved in the guilherr.me Design System artifact; this folder is what the code reads.

## Where things are

| What | Where |
| --- | --- |
| Token source (names, values, a note of use per token) | `design/system/tokens.json` |
| Generated Tailwind theme | `design/system/tokens.css` (do not edit; run the generator) |
| One file to import | `design/system/theme.css` |
| Fonts (Ubuntu, Geist Mono, Caveat) | `@fontsource` packages, imported in `app/layout.tsx` |
| Components (intermediates) | `components/` |
| Library components (shadcn/ui, untouched) | `components/ui/` |
| Variant classes of a control | `components/<Name>Classes.ts` (`ButtonClasses.ts`) |
| Class merging | `src/Utils/ClassNameUtil.ts` |

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
- **Motion.** Only `transform` and `opacity` animate; the few exceptions (signature stroke, marker highlight) are listed in the artifact. `prefers-reduced-motion` turns animation off (`app/globals.css`).
- **Accessibility.** Text contrast of 4.5:1 (3:1 for large text, control borders and icons), focus ring only from the keyboard, touch targets of 44 px. `e2e/*.spec.ts` runs axe on every page type.
- **A new token or component** is decided in the artifact first, then written here.

## Open questions

- Geist Mono is provisional, taken from the prototype.
- The new logo and favicon are not drawn.
