import { expect, test } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";
import { screenNameToViewport } from "./viewports.ts";

const OPEN_MENU = "Open the menu";

test.describe("the mobile menu on a phone", () => {
  test.use({ viewport: screenNameToViewport.mobile });

  test("Escape closes the menu and returns focus to the toggle", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: OPEN_MENU });
    await toggle.click();
    await expect(page.locator("#mobile-menu")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    await expect(page.getByRole("button", { name: OPEN_MENU })).toBeFocused();
  });

  test("Tab on the last item keeps the focus inside the menu", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: OPEN_MENU }).click();
    const menuLinks = page.locator("#mobile-menu a");
    await expect(menuLinks.first()).toBeVisible();
    await menuLinks.last().focus();

    await page.keyboard.press("Tab");

    await expect(menuLinks.first()).toBeFocused();
  });
});
