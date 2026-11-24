import type { Page } from "@playwright/test";

const SITE_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;
const EMPTY_SCRIPT_BODY = "";

export const stubThirdParties = async (page: Page) => {
  // Why: the tag manager loader lives on another host and fires its own requests, which the browser aborts when the test ends; the site is judged on its own requests, so every other origin gets an empty script.
  await page.route(
    (url) => !SITE_ORIGIN_PATTERN.test(url.href),
    (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: EMPTY_SCRIPT_BODY }),
  );
};
