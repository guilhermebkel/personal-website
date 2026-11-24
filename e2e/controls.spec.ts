import { expect, test } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";
import { screenNameToViewport } from "./viewports.ts";

const PRESSED = "aria-pressed";
const RING_EXTENT = 4;

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

  test("the focus ring of a project card is not cut by the carousel", { tag: NEEDS_BROWSER }, async ({ page }) => {
    // Why: the card rises 18px when it first shows; reduced motion ends that at once, so the box is read where it rests.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const card = page.locator("#projects a").first();

    await card.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");

    const readBoxes = (element: HTMLElement) => {
      const link = element.getBoundingClientRect();
      const track = element.closest("ul")?.getBoundingClientRect();
      return { link: { y: link.y, height: link.height }, track: track && { y: track.y, height: track.height } };
    };
    const isInsideTrack = async () => {
      const { link, track } = await card.evaluate(readBoxes);
      if (track === undefined) {
        return false;
      }
      // Why: the 2px ring sits 2px outside the card, so the track needs 4px on each side of the card for it to show.
      return link.y - RING_EXTENT >= track.y && link.y + link.height + RING_EXTENT <= track.y + track.height;
    };
    // Why: the card is read where it rests; the scroll that focus starts and the card's entrance settle within a few frames, so the test polls until the box is still.
    await expect.poll(isInsideTrack).toBe(true);
  });

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
