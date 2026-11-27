import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CRITICAL_FLOW, NEEDS_BROWSER } from "./tags.ts";

const HYDRATION_TIMEOUT_MS = 15_000;
// Why: 70% of the 844 px phone window, rounded up by one pixel for subpixel layout.
const MAX_FIGURE_HEIGHT_PX = 591;

test("a post opens from the list", { tag: CRITICAL_FLOW }, async ({ page }) => {
  await page.goto("/blog/");

  await page.getByRole("link", { name: "How to Install Rancher inside AWS EKS" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "How to Install Rancher inside AWS EKS" })).toBeVisible();
});

test("the post page has no accessibility violations", { tag: NEEDS_BROWSER }, async ({ page }) => {
  // Why: the entrance animations fade the text in, and a contrast check in the middle of a fade reads the wrong color, so this test runs the page as a reader with reduced motion sees it.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/how-to-install-rancher-inside-aws-eks/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toStrictEqual([]);
});

test("a post taller than the window shows its body", { tag: NEEDS_BROWSER }, async ({ page }) => {
  // Why: the body is one block that starts hidden and is revealed when seen; a long post is much taller than the window, so this runs with the entrance animations on (no reduced motion) to catch a body that never appears.
  await page.goto("/blog/how-to-install-rancher-inside-aws-eks/");

  // Why: the first section heading of the post, not a named one, so rewriting the post's sections does not break this test.
  const body = page
    .locator("[data-visible]")
    .filter({ has: page.getByRole("heading", { level: 2 }) })
    .first();
  const heading = body.getByRole("heading", { level: 2 }).first();

  await heading.scrollIntoViewIfNeeded();

  // Why: the block is revealed once the page has hydrated, and a long post with 24 images hydrates slowly on a busy machine, so this waits longer than the default 5 s.
  await expect(body).toHaveAttribute("data-visible", "true", { timeout: HYDRATION_TIMEOUT_MS });
});

test("a figure taller than the window scales down to fit it", { tag: NEEDS_BROWSER }, async ({ page }) => {
  // Why: on a phone a top-down diagram is much taller than the window; the figure height (70% of 844 px, about 590 px) keeps it whole on screen.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/blog/handling-a-request-with-no-scope/");

  const images = page.locator("figure img");
  await expect(images.first()).toBeVisible();
  const heights = await images.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().height),
  );

  expect(heights.length).toBeGreaterThan(0);
  expect(heights.filter((height) => height > MAX_FIGURE_HEIGHT_PX)).toStrictEqual([]);
});
