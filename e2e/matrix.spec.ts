import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { NEEDS_BROWSER } from "./tags.ts";
import { stubThirdParties } from "./thirdParties.ts";
import { screenNameToViewport } from "./viewports.ts";

// Why: every route a visitor can reach, including the 404 that renders for a missing path.
const ROUTES = ["/", "/blog/", "/blog/how-to-install-rancher-inside-aws-eks/", "/nothing-here/"];
const NOT_FOUND = 404;
const CONSOLE_ERROR = "error";

const findBrokenSectionLabels = (page: Page) =>
  // Why: a section that names its heading with aria-labelledby is only labelled if the id exists; a missing id leaves a region with no name.
  page.evaluate(() =>
    [...document.querySelectorAll("section[aria-labelledby]")]
      .filter((section) => document.getElementById(section.getAttribute("aria-labelledby") ?? "") === null)
      .map((section) => `${section.id || "(no id)"} -> ${section.getAttribute("aria-labelledby")}`),
  );

for (const [viewportName, viewport] of Object.entries(screenNameToViewport)) {
  test.describe(`every route at ${viewportName} (${viewport.width}px), reduced motion`, () => {
    test.use({ viewport, reducedMotion: "reduce" });

    for (const route of ROUTES) {
      test.describe(route, () => {
        test("has no accessibility violations", { tag: NEEDS_BROWSER }, async ({ page }) => {
          await page.goto(route);

          const results = await new AxeBuilder({ page }).analyze();

          expect(results.violations).toStrictEqual([]);
        });

        test("never scrolls sideways", { tag: NEEDS_BROWSER }, async ({ page }) => {
          await page.goto(route);

          const overflowPx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

          expect(overflowPx).toBeLessThanOrEqual(0);
        });

        test("has exactly one h1", { tag: NEEDS_BROWSER }, async ({ page }) => {
          await page.goto(route);

          await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        });

        test("names every section by an id that exists", { tag: NEEDS_BROWSER }, async ({ page }) => {
          await page.goto(route);

          expect(await findBrokenSectionLabels(page)).toStrictEqual([]);
        });

        test("logs no console error and no failed request", { tag: NEEDS_BROWSER }, async ({ page }) => {
          await stubThirdParties(page);
          const consoleErrors: { text: string; url: string }[] = [];
          const problems: string[] = [];
          page.on("console", (message) => {
            if (message.type() !== CONSOLE_ERROR) {
              return;
            }
            consoleErrors.push({ text: message.text(), url: message.location().url });
          });
          page.on("requestfailed", (request) => {
            problems.push(`request: ${request.url()}`);
          });
          const response = await page.goto(route);
          await expect(page.locator("main")).toBeVisible();
          // Why: a missing route is served as a 404 document, and the browser logs that status once for the document itself; any other error still counts.
          const ownDocumentStatus = response?.status() === NOT_FOUND ? response.url() : undefined;
          for (const error of consoleErrors) {
            if (error.url !== ownDocumentStatus) {
              problems.push(`console: ${error.text}`);
            }
          }

          expect(problems).toStrictEqual([]);
        });

        test("moves focus to main from the skip link", { tag: NEEDS_BROWSER }, async ({ page }) => {
          await page.goto(route);

          await page.keyboard.press("Tab");
          const skipLink = page.getByRole("link", { name: "Skip to content" });
          await expect(skipLink).toBeFocused();
          await page.keyboard.press("Enter");

          await expect(page.getByRole("main")).toBeFocused();
        });
      });
    }
  });
}

test("a section whose heading id is missing is reported by name", { tag: NEEDS_BROWSER }, async ({ page }) => {
  // Why: the check must fail on a broken page, not only pass on the fixed site; this fixture is the broken markup.
  await page.setContent(
    '<main><section id="posts" aria-labelledby="posts-title"><h2 id="other-title">Posts</h2></section></main>',
  );

  expect(await findBrokenSectionLabels(page)).toStrictEqual(["posts -> posts-title"]);
});
