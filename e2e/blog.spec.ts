import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CRITICAL_FLOW, NEEDS_BROWSER } from "./tags.ts";

const HYDRATION_TIMEOUT_MS = 15_000;

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

  const heading = page.getByRole("heading", { level: 2, name: "Creating the IAM Roles" });
  const body = page.locator("[data-visible]").filter({ has: heading });

  await heading.scrollIntoViewIfNeeded();

  // Why: the block is revealed once the page has hydrated, and a long post with 24 images hydrates slowly on a busy machine, so this waits longer than the default 5 s.
  await expect(body).toHaveAttribute("data-visible", "true", { timeout: HYDRATION_TIMEOUT_MS });
});
