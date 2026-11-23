import { expect, test } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";

const PHONE = { width: 390, height: 844 };
const PAGES = ["/", "/blog/", "/blog/hello-world/", "/nothing-here/"];

test("the first Tab reaches a skip link that moves the focus to the main content", { tag: NEEDS_BROWSER }, async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("main")).toBeFocused();
});

test.describe("layout on a phone", () => {
  test.use({ viewport: PHONE });

  for (const path of PAGES) {
    test(`${path} never scrolls sideways`, { tag: NEEDS_BROWSER }, async ({ page }) => {
      await page.goto(path);

      const overflowPx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

      expect(overflowPx).toBeLessThanOrEqual(0);
    });
  }
});
