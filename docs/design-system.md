# Design system in code

The guilherr.me Design System artifact is the mirror of what was approved. In code, `app/globals.css` is the source of the tokens: when the two disagree, the code wins until the owner decides, and the artifact is then updated.

- **One dark theme.** Page ground is graphite (`--color-bg`); the footer band is `--color-bg-deep`.
- **Roles, not values.** Components use `--color-text`, `--color-accent-text`, `--color-border-strong` and so on, never the raw palette and never a hex.
- **Type.** Ubuntu for text and titles, Geist Mono (provisional) for labels and metadata, Caveat only for the signature at the end of a post.
- **Motion.** Only `transform` and `opacity` animate; the few exceptions (signature stroke, marker highlight) are listed in the artifact. `prefers-reduced-motion` turns animation off (already in `globals.css`).
- **Accessibility.** Text contrast of 4.5:1 (3:1 for large text, control borders and icons), focus ring only from the keyboard, touch targets of 44px. `e2e/*.spec.ts` runs axe on every page type.
- **A new token or component** is decided in the artifact first, then written here.
