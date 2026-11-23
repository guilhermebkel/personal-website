# Tailwind v4 with the tokens generated from `design/system/tokens.json`

## Decision

- Tailwind v4 is the styling system, as in `tocomevidencia` (its ADR 0008). Components write utility classes in their markup.
- The tokens have one source: `design/system/tokens.json`, the file that mirrors the guilherr.me Design System artifact. `pnpm design:tokens` writes `design/system/tokens.css` (a Tailwind `@theme`), and `app/globals.css` imports it through `design/system/theme.css`. This is the layout the `pebo` repository uses for its design system.
- The theme resets Tailwind's default colors, text sizes and radii, so only the design system's names exist as classes (`bg-graphite`, `text-text-soft`, `text-body`, `rounded-md`). A hex or an arbitrary value in a class is a review failure.
- `app/globals.css` holds the layer order, the imports and the base element styles only. One dark theme; no light theme.

## Considered options

- Plain CSS tokens in `:root` and hand-written classes (the first base of this repo): no dependency, but every control would be rebuilt by hand and the tokens would live in two places.
- Tokens written straight in `@theme` inside `globals.css`: simpler, but then the artifact mirror has no machine-readable source and a note of use per token has no home.

## Cost

A new dependency pair (`tailwindcss`, `@tailwindcss/postcss`) and a generator to keep in step. `scripts/build-design-tokens.test.mjs` fails when `tokens.css` does not match `tokens.json`.
