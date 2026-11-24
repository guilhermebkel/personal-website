import { expect, test } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";
import { screenNameToViewport } from "./viewports.ts";

const PRESSED = "aria-pressed";

test.describe("the carousels and the blog controls on a desktop", () => {
  test.use({ viewport: screenNameToViewport.desktop });

  test(
    "the project arrows are buttons, both disabled when the one project fits",
    { tag: NEEDS_BROWSER },
    async ({ page }) => {
      await page.goto("/");

      await expect(page.getByRole("button", { name: "Previous projects" })).toBeDisabled();
      await expect(page.getByRole("button", { name: "Next projects" })).toBeDisabled();
    },
  );

  test(
    "a quote counter is a button, and Enter makes its quote the current one",
    { tag: NEEDS_BROWSER },
    async ({ page }) => {
      await page.goto("/");
      const second = page.getByRole("button", { name: "Quote 02" });

      await second.focus();
      await page.keyboard.press("Enter");

      await expect(second).toHaveAttribute("aria-current", "true");
    },
  );

  test("the grid and list buttons switch the view with the keyboard", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/blog/");
    const grid = page.getByRole("button", { name: "Show as a grid" });
    const list = page.getByRole("button", { name: "Show as a list" });
    await expect(grid).toHaveAttribute(PRESSED, "true");

    await list.focus();
    await page.keyboard.press("Enter");

    await expect(list).toHaveAttribute(PRESSED, "true");
    await expect(grid).toHaveAttribute(PRESSED, "false");
  });

  test("the order select changes to oldest first", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/blog/");
    const order = page.getByRole("combobox");
    await expect(order).toHaveValue("recent");

    await order.selectOption("oldest");

    await expect(order).toHaveValue("oldest");
  });
});
