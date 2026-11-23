import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CRITICAL_FLOW, NEEDS_BROWSER } from "./tags.ts";

test("a post opens from the list", { tag: CRITICAL_FLOW }, async ({ page }) => {
  await page.goto("/blog/");

  await page.getByRole("link", { name: "Hello, world" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Hello, world" })).toBeVisible();
});

test("the post page has no accessibility violations", { tag: NEEDS_BROWSER }, async ({ page }) => {
  // Why: the entrance animations fade the text in, and a contrast check in the middle of a fade reads the wrong color, so this test runs the page as a reader with reduced motion sees it.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/hello-world/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toStrictEqual([]);
});
