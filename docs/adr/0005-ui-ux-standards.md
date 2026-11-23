# UI and UX standards adapted from tocomevidencia

Screens written by different agents drifted: focus, touch size, empty and error states, motion. The harness follows `tocomevidencia`, which solved this with `docs/ui-ux-standards.md` and an ADR that records where the rules came from. This site needs the same single document, cut to a static site with one dark theme.

## Decision

- `docs/ui-ux-standards.md` holds the rules, one line each, marked with how they are checked: lint, test, e2e or review.
- The rules are adapted, in our own words, from `tocomevidencia/docs/ui-ux-standards.md`; the third-party guides behind them (Vercel Web Interface Guidelines, Impeccable, Anthropic `frontend-design`, UI UX Pro Max, WCAG 2.2 and WAI-ARIA) are listed with their licenses in that repository's ADR 0010. WCAG 2.2 and the WAI-ARIA Authoring Practices apply to this site directly.
- Left out because the site has none of it: chat feedback, loading of writes, optimistic UI, toasts, drawers, dialogs, resizable panels and forms.
- Each rule a tool can check is a tool: `jsx-a11y` strict and `local/tokens-only` in `pnpm lint`, `scripts/globals-css-check.mjs` in `pnpm test`, and Playwright specs with axe in `pnpm test:e2e`.

## Cost

A review rule that is broken twice has to become a tool, as `docs/harness-standards.md` says. New UI rules go in the standards, and a new source goes in this ADR with its URL, what was taken and its license.
