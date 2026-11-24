# Google Tag Manager, loaded from the static host

The owner measures the site with Google Tag Manager, as on the other sites he runs (`ultimate-nostalgia-online`). The container is `GTM-W4RVNG3`, and its loader is served from the site's own static host (`static.guilherr.me/js/gtm.js`), which holds the one-line snippet that calls `googletagmanager.com`. Serving the loader from the owner's host keeps the snippet editable without a deploy of this site.

## Decision

- `app/layout.tsx` loads `https://static.guilherr.me/js/gtm.js` with `next/script` at `beforeInteractive`, so the first page view is counted and the script runs before the page is interactive.
- Next injects the script at runtime; it is not in the static HTML. `pnpm check:budgets` therefore does not count it, and the JavaScript budget (`docs/harness-standards.md`) stays about the site's own code.
- Measurement lives in the container, not in this repository. Tags, triggers and properties are changed in Google Tag Manager; a change there does not need a pull request here.
- The loader stays on the owner's host. The URL is one constant in `app/layout.tsx`.

## Cost

- **Visitor data goes to Google.** Every page view is sent to the properties the container configures. The site has no consent banner and no consent check before the script loads, so the visitor cannot refuse the tag. Brazilian visitors are covered by the LGPD, so a consent step is owed before this is used for the public. Until it exists, the tag stays as the owner's decision, and this is the open point of this ADR.
- **Test runs send hits.** `pnpm test:e2e` and CI load the real container, so each run sends page views from `localhost` or from CI into the properties. The container should filter hits by hostname, or the e2e suite should block the two hosts; neither is done yet.
- **A host outside Google depends on the owner's server.** If `static.guilherr.me` is down, the tag does not load and nothing breaks on the page.
