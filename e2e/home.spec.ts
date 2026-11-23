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

test("the projects link lands the section just below the navbar", { tag: NEEDS_BROWSER }, async ({ page }) => {
  await page.goto("/");
  await page.goto("/#projects");

  // Why: the section's scroll margin is the navbar height (64px token), so its top edge sits right under the bar.
  const { top, scrollMargin } = await page.locator("#projects").evaluate((section) => ({
    top: section.getBoundingClientRect().top,
    scrollMargin: parseFloat(getComputedStyle(section).scrollMarginTop),
  }));
  expect(scrollMargin).toBe(64);
  expect(Math.abs(top - scrollMargin)).toBeLessThan(2);
});

test("each home section is a named region", { tag: NEEDS_BROWSER }, async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "What I've been writing" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Words I build on" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Let's talk" })).toBeVisible();
});

test("the home has no accessibility violations", { tag: NEEDS_BROWSER }, async ({ page }) => {
  // Why: the entrance animations fade the text in, and a contrast check in the middle of a fade reads the wrong color, so this test runs the page as a reader with reduced motion sees it.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toStrictEqual([]);
});
