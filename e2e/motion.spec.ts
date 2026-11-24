import { expect, test } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";

// Why: these run after the page settles by design: the quote carousel's autoplay bar fills and restarts until the reader stops it. Reduced motion stops them (the first test below).
const LOOPING_ANIMATIONS = ["quote-progress"];
const MAX_RESET_DELAY_SECONDS = 0.01;

const readRunningAnimationNames = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.playState === "running")
      .map((animation) => (animation instanceof CSSAnimation ? animation.animationName : animation.constructor.name))
      .sort(),
  );

test.describe("motion with reduced motion on", () => {
  test.use({ reducedMotion: "reduce" });

  test("the home runs no animation after it loads", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");

    await expect.poll(() => readRunningAnimationNames(page)).toStrictEqual([]);
  });

  test("the hero buttons enter without their stagger delay", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");

    const delay = await page
      .locator('a[href="#projects"]')
      .evaluate((link) => getComputedStyle(link.closest("[data-visible]") ?? link).animationDelay);
    // Why: the reset gives the instant duration (10 ms at most); a stagger delay is 100 ms or more.
    expect(Number.parseFloat(delay)).toBeLessThanOrEqual(MAX_RESET_DELAY_SECONDS);
  });

  test("the hero name is already in its final state", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Guilherme Mota" })).toBeVisible();
    const opacity = await page
      .locator("h1 > span")
      .first()
      .evaluate((name) => getComputedStyle(name).opacity);
    expect(opacity).toBe("1");
  });
});

test.describe("motion with reduced motion off", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the hero name finishes its write animation once", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");

    await expect
      .poll(() =>
        page
          .locator("h1 > span")
          .first()
          .evaluate((name) => name.getAnimations().map((animation) => animation.playState)),
      )
      .toStrictEqual(["finished"]);
  });

  test("after the hero settles only the looping animations run", { tag: NEEDS_BROWSER }, async ({ page }) => {
    await page.goto("/");

    await expect.poll(() => readRunningAnimationNames(page)).toStrictEqual(LOOPING_ANIMATIONS);
  });
});
