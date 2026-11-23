# Design

The visual side of guilherr.me. The approved prototype and the design system live in the **guilherr.me Design System** artifact; this folder holds what the code reads from it. The artifact is the mirror of what was approved; when it and the code disagree, the code wins until the owner decides (`design/system/DESIGN.md`).

## Files

- `system/`: the design system in code. Token source (`tokens.json`), the generated Tailwind theme (`tokens.css`), the one file to import (`theme.css`), how it works (`DESIGN.md`) and the component index (`README.md`).

There is no `art/` or `prototype/` folder yet. When a prototype or an image is saved here as a reference, it goes in `prototype/` (reference only, never imported by the app) and this guide gets a line.

## Brand

- **Name:** written `guilherr.me` in the interface and `Guilherme Mota` in titles.
- **Color:** graphite ground and one brand purple; the palette is in `system/tokens.json`.
- **Type:** Ubuntu for text, Geist Mono (provisional) for labels and metadata, Caveat for the signature only.
- **Logo and favicon:** the new logo is not drawn yet; the preloader and the favicon wait for it.
