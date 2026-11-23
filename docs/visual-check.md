# Visual checks

How to look at a change on screen and compare it with the approved prototype. Screenshots are for looking, assertions are for checking: a spec asserts text and structure, and the PNG is read by eye.

The site is static, so there is nothing to mock: the check runs against the `out/` folder that `pnpm build` writes, served the same way `pnpm test:e2e` serves it.

## Playwright browsers

Chromium is not bundled with the repo. `scripts/ensure-playwright.mjs` runs before `pnpm test:e2e` and the e2e step of `pnpm check`; it installs Chromium when `chromium.executablePath()` points at nothing, and exits at once when the browser is there. Prefer the `package.json` commands over a bare `playwright test`, so the check always runs.

## Take the screenshot

Put the capture in a throwaway spec under `e2e/` (for example `e2e/home-visual.spec.ts`), run it, read the PNGs and delete the spec. Save each PNG with `test.info().outputPath()`, which goes to `test-results/` (gitignored); never commit a PNG.

```ts
import { expect, test } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";

test.describe("home layout", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("matches the prototype at desktop width", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Guilherme Mota" })).toBeVisible();

    await page.screenshot({ path: test.info().outputPath("home-desktop.png"), fullPage: true });
  });
});
```

Rules that keep the capture stable:

- **Wait for the state before the capture.** Assert a heading or text that only appears when the screen is ready.
- **Fixed viewport per capture.** Set it with `test.use({ viewport })`: `1280x800` for desktop, `390x844` for mobile.
- **One theme.** The site has only the dark theme, so a capture needs no theme switch.
- **Motion.** Call `page.emulateMedia({ reducedMotion: "reduce" })` so a screen with motion shows its still state.
- **Name the file** by screen and size (`home-mobile.png`), one state per test.

Run only the visual spec while you work:

```sh
pnpm build
pnpm test:e2e -- e2e/home-visual.spec.ts
```

For a change that needs no whole screen (a button in each state), a throwaway page under `app/` is not committed either: render the states side by side, capture, then delete it.

## Compare with the prototype

1. Get the prototype image. The approved prototype and the design system live in the design system artifact; save a screenshot of the same screen at the same viewport. A link is not enough.
2. Open both PNGs with the Read tool and compare them side by side: positions, sizes, spacing, color and borders.
3. Write each difference as a concrete change ("the gap between the title and the first project is 40 px in the prototype and 32 px here"). Fix the code and capture again.

Pixel-diff tools such as `toHaveScreenshot()` are not used: their baselines depend on the operating system and the fonts, so they break between a sandbox and CI. Compare by eye, and assert only on text and structure.

## Checklist

- [ ] The state was reached with an assertion before the capture.
- [ ] Viewport is set in the test (`1280x800` and `390x844`), not left to the default.
- [ ] The PNG went to `test.info().outputPath()`, not into the repository.
- [ ] The throwaway spec was deleted after the check.
- [ ] Each difference found against the prototype was written down and fixed before the next capture.
