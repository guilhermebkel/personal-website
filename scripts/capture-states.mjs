import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ARGUMENTS_OFFSET = 2;
const PAD = 16;
const DEVICE_SCALE = 2;
const SETTLE_MS = 1500;
const SHORT_MS = 100;
const CENTRE = { block: "center", inline: "center" };
const FIRST_LINE = 0;
const HALF = 0.5;
const PAIR = 2;
const JSON_INDENT = 2;
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

// Why: each control is found by its accessible name or its markup, as a screen reader finds it; a control that is not on a page is listed as skipped.
const CONTROLS = [
  {
    name: "button-primary",
    url: "/",
    locate: (page) => page.locator('a[href="#projects"]').first(),
    states: ["rest", "hover", "focus", "pressed", "disabled"],
  },
  {
    name: "link-text",
    url: "/",
    locate: (page) => page.getByRole("link", { name: "Read the posts" }),
    states: ["rest", "hover", "focus", "pressed", "disabled"],
  },
  {
    name: "contact-link",
    url: "/",
    locate: (page) => page.locator("#contact a").first(),
    states: ["rest", "hover", "focus", "pressed"],
  },
  {
    name: "social-icon",
    url: "/",
    locate: (page) => page.locator('a[href*="github.com"]').first(),
    states: ["rest", "hover", "focus"],
  },
  {
    name: "project-open",
    url: "/",
    locate: (page) => page.locator("#projects a").first(),
    states: ["rest", "hover", "focus", "pressed"],
  },
  {
    name: "row-go",
    url: "/",
    locate: (page) => page.locator('a[href^="/blog/"]:has(h3)').first(),
    states: ["rest", "hover", "focus"],
  },
  {
    name: "carousel-arrow-next",
    url: "/",
    locate: (page) => page.getByRole("button", { name: "Next projects" }),
    states: ["rest", "hover"],
  },
  {
    name: "quote-counter",
    url: "/",
    locate: (page) => page.getByRole("button", { name: "Quote 02" }),
    states: ["rest", "hover", "focus", "pressed"],
  },
  {
    name: "sort-select",
    url: "/blog/",
    locate: (page) => page.getByRole("combobox"),
    states: ["rest", "hover", "focus"],
  },
  {
    name: "view-grid-selected",
    url: "/blog/",
    locate: (page) => page.getByRole("button", { name: "Show as a grid" }),
    states: ["rest", "hover", "focus", "pressed"],
  },
  {
    name: "view-list",
    url: "/blog/",
    locate: (page) => page.getByRole("button", { name: "Show as a list" }),
    states: ["rest", "hover", "focus", "pressed"],
  },
  {
    name: "tag-post",
    url: "/blog/",
    locate: (page) =>
      page
        .locator("ul li span")
        .filter({ hasText: /^[a-z]/u })
        .first(),
    states: ["rest"],
  },
  {
    name: "navbar-toggle",
    url: "/",
    mobileOnly: true,
    locate: (page) => page.locator("button[aria-expanded]").first(),
    states: ["rest", "hover", "focus", "pressed"],
  },
  {
    name: "skip-link",
    url: "/",
    locate: (page) => page.getByRole("link", { name: "Skip to content" }),
    states: ["focus"],
  },
];

const scrollToCentre = (locator) => locator.evaluate((element, options) => element.scrollIntoView(options), CENTRE);

const applyHover = async (page, locator) => {
  await locator.hover();
};

const applyRest = async (page, locator) => {
  await locator.evaluate((element) => element.blur());
};

const applyFocus = async (page, locator) => {
  await locator.focus();
  // Why: a keyboard focus is the only one that shows the ring, so Shift+Tab then Tab gives focus-visible without a mouse.
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
};

const applyPress = async (page, locator) => {
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + box.width * HALF, box.y + box.height * HALF);
  await page.mouse.down();
};

const applyDisabled = async (_page, locator) => {
  await locator.evaluate((element) => element.setAttribute("disabled", ""));
};

const STATE_HANDLERS = {
  rest: applyRest,
  hover: applyHover,
  focus: applyFocus,
  pressed: applyPress,
  disabled: applyDisabled,
};

const releasePress = async (page) => {
  await page.mouse.up();
};

const RELEASE_HANDLERS = {
  pressed: releasePress,
};

const saveClip = async (page, locator, file) => {
  const box = await locator.boundingBox();
  if (box === null) {
    return false;
  }
  await page.screenshot({
    path: file,
    clip: {
      x: Math.max(0, box.x - PAD),
      y: Math.max(0, box.y - PAD),
      width: box.width + PAD * PAIR,
      height: box.height + PAD * PAIR,
    },
  });
  return true;
};

const openStatePage = async (context, control) => {
  const page = await context.newPage();
  await page.goto(`${control.baseUrl}${control.url}`);
  // Why: the hero reveals wait out their stagger delay even with reduced motion, so the page is given time to show them.
  await page.waitForTimeout(SETTLE_MS);
  return page;
};

const captureState = async ({ context, control, state, directory, report, viewportName }) => {
  const key = `${viewportName}/${control.name}-${state}`;
  const page = await openStatePage(context, control);
  const locator = control.locate(page);
  if ((await locator.count()) === 0) {
    report.skipped.push(`${key}: not on ${control.url}`);
    await page.close();
    return;
  }
  const file = join(directory, `${control.name}-${state}.png`);
  try {
    await scrollToCentre(locator);
    await page.mouse.move(0, 0);
    await STATE_HANDLERS[state](page, locator);
    await page.waitForTimeout(SHORT_MS);
    const saved = await saveClip(page, locator, file);
    report[saved ? "captured" : "skipped"].push(saved ? key : `${key}: not visible`);
    await RELEASE_HANDLERS[state]?.(page);
  } catch (error) {
    report.skipped.push(`${key}: ${error.message.split("\n")[FIRST_LINE]}`);
  }
  await page.close();
};

const captureControl = async ({ browser, viewportName, viewport, control, outputDir, report }) => {
  const directory = join(outputDir, viewportName);
  mkdirSync(directory, { recursive: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: DEVICE_SCALE, reducedMotion: "reduce" });
  for (const state of control.states) {
    await captureState({
      control: { ...control, baseUrl: report.baseUrl },
      context,
      directory,
      report,
      state,
      viewportName,
    });
  }
  await context.close();
};

const isShownOn = (control, viewportName) => control.mobileOnly !== true || viewportName === "mobile";

const captureViewport = async ({ browser, viewportName, viewport, outputDir, report }) => {
  for (const control of CONTROLS) {
    if (isShownOn(control, viewportName)) {
      await captureControl({ browser, viewportName, viewport, control, outputDir, report });
    }
  }
};

const captureAll = async ({ chromiumPath, baseUrl, outputDir }) => {
  const browser = await chromium.launch({ executablePath: chromiumPath, args: ["--no-sandbox"] });
  const report = { baseUrl, captured: [], skipped: [] };
  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      await captureViewport({ browser, viewportName, viewport, outputDir, report });
    }
  } finally {
    await browser.close();
  }
  mkdirSync(outputDir, { recursive: true });
  const reportPath = join(outputDir, "report.json");
  const reportText = JSON.stringify(report, null, JSON_INDENT);
  writeFileSync(reportPath, reportText);
  return report;
};

const isMain = () => process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  // Why: the browser, the address and the output folder are arguments, so the script reads no environment variable.
  const [chromiumPath, baseUrl, outputDir] = process.argv.slice(ARGUMENTS_OFFSET);
  const report = await captureAll({ chromiumPath, baseUrl, outputDir });
  process.stdout.write(
    `captured ${report.captured.length}, skipped ${report.skipped.length}\n${report.skipped.join("\n")}\n`,
  );
}

export { CONTROLS, captureAll };
