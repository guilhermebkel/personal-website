import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { captureBoard } from "./prototype-shots.mjs";
import { BOARD_MAPPING, CANVAS_FILE, captureFileName, boardsForRoutes, loadBoards } from "./prototype-boards.mjs";

export const EXIT_OK = 0;
export const EXIT_FAILED = 1;
export const EXIT_USAGE = 2;
export const SITE_PORT = 3101;
const SIDE_BY_SIDE_COUNT = 2;
const GAP_PX = 24;
const COMPARE_HEIGHT_PX = 900;
// Why: argv holds the node binary and the script path before the user arguments.
const FIRST_ARG_INDEX = 2;
const SITE_DIR = "out";
const SERVER_WAIT_MS = 30000;
const SERVER_POLL_MS = 250;
const MENU_BUTTON = "button[aria-controls]";
const FROZEN_CSS = "*,*::before,*::after{animation:none!important;transition:none!important;}";

// Pure: the side-by-side page: the prototype on the left, the site on the right, both at the same width.
export const buildComparePage = ({ prototypePng, sitePng }) => {
  return `<!doctype html><html><body style="margin:0;background:#202020;display:flex;gap:24px;align-items:flex-start">
<img alt="Prototype" src="${prototypePng}" style="display:block">
<img alt="Site" src="${sitePng}" style="display:block">
</body></html>`;
};

// Why: the site is served the way `pnpm test:e2e` serves it, and this run stops the server it started.
const startSiteServer = () => {
  const child = spawn("pnpm", ["exec", "serve", SITE_DIR, "-l", String(SITE_PORT)], {
    stdio: "ignore",
    detached: true,
  });
  return child;
};

const waitForSite = async () => {
  const deadline = Date.now() + SERVER_WAIT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${SITE_PORT}/`);
      if (response.ok) {
        return true;
      }
    } catch {
      // Why: the server is not listening yet; the poll goes on until the deadline.
    }
    await new Promise((done) => setTimeout(done, SERVER_POLL_MS));
  }
  return false;
};

// Why: a board that opens a menu is captured with the menu open, as the prototype shows it.
const captureSite = async ({ browser, name, mapping, board }) => {
  // Why: the site is captured at the board's own width and height, so the two sides of the comparison line up.
  const context = await browser.newContext({
    viewport: { width: board.width, height: board.height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto(`http://localhost:${SITE_PORT}${mapping.route}`);
    await page.addStyleTag({ content: FROZEN_CSS });
    await page.evaluate(() => globalThis.document.fonts.ready);
    const output = captureFileName(name, "site");
    if (mapping.openMenu === true) {
      await page.locator(MENU_BUTTON).click();
      await page.screenshot({ path: output });
    } else if (mapping.target === "page") {
      await page.screenshot({ path: output });
    } else {
      await page.locator(mapping.target).first().screenshot({ path: output, animations: "disabled" });
    }
    return output;
  } finally {
    await context.close();
  }
};

const composeCompare = async ({ browser, name, prototypePng, sitePng, width }) => {
  const comparePath = captureFileName(name, "compare");
  const htmlPath = `test-results/prototype/${name}.compare.html`;
  writeFileSync(
    htmlPath,
    buildComparePage({
      prototypePng: pathToFileURL(resolve(prototypePng)).href,
      sitePng: pathToFileURL(resolve(sitePng)).href,
    }),
  );
  const page = await browser.newPage({
    viewport: { width: width * SIDE_BY_SIDE_COUNT + GAP_PX, height: COMPARE_HEIGHT_PX },
  });
  try {
    await page.goto(pathToFileURL(resolve(htmlPath)).href);
    await page.evaluate(() => Promise.all([...globalThis.document.images].map((image) => image.decode())));
    await page.screenshot({ path: comparePath, fullPage: true });
  } finally {
    await page.close();
  }
  return comparePath;
};

const main = async () => {
  if (!existsSync(SITE_DIR)) {
    process.stderr.write("out/ is missing: run pnpm build first.\n");
    return EXIT_FAILED;
  }
  const canvas = JSON.parse(readFileSync(CANVAS_FILE, "utf8"));
  const boards = loadBoards(canvas);
  const routes = process.argv.slice(FIRST_ARG_INDEX);
  const selected = boardsForRoutes({ routes, boards });
  if (selected.error !== undefined) {
    process.stderr.write(`${selected.error}\n`);
    return EXIT_USAGE;
  }
  mkdirSync("test-results/prototype", { recursive: true });
  const server = startSiteServer();
  const browser = await chromium.launch();
  try {
    if (!(await waitForSite())) {
      process.stderr.write(`The site did not start on port ${SITE_PORT}.\n`);
      return EXIT_FAILED;
    }
    for (const name of selected.names) {
      const board = boards.find((candidate) => candidate.name === name);
      const prototypePng = await captureBoard({ browser, board });
      const sitePng = await captureSite({ board, browser, name, mapping: BOARD_MAPPING[name] });
      const comparePng = await composeCompare({ browser, name, prototypePng, sitePng, width: board.width });
      process.stdout.write(`${comparePng}\n`);
    }
    return EXIT_OK;
  } finally {
    await browser.close();
    process.kill(-server.pid);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await main());
}
