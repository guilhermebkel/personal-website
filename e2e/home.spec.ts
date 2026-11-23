import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { CRITICAL_FLOW, NEEDS_BROWSER } from "./tags.ts";

test("the home shows the name and links to the posts", { tag: CRITICAL_FLOW }, async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Guilherme Mota" })).toBeVisible();
  await page.getByRole("link", { name: "Posts", exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/u);
});

test("an unknown path shows the 404 page", { tag: CRITICAL_FLOW }, async ({ page }) => {
  await page.goto("/nothing-here/");

  await expect(page.getByRole("heading", { name: "Nothing here. I probably moved it." })).toBeVisible();
});

test("the home has no accessibility violations", { tag: NEEDS_BROWSER }, async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toStrictEqual([]);
});
