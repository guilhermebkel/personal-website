import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { BOARD_DIR, CANVAS_FILE, captureFileName, loadBoards, resolveBoardNames } from "./prototype-boards.mjs";

export const EXIT_OK = 0;
export const EXIT_USAGE = 2;
// Why: argv holds the node binary and the script path before the user arguments.
const FIRST_ARG_INDEX = 2;

// Why: the boards' animations loop as demos; freezing them at their end state gives the final frame of each board.
const FROZEN_CSS = "*,*::before,*::after{animation:none!important;transition:none!important;}";

// Why: the board's own size is the viewport, so its PNG has the width and height of the board in canvas.json.
export const captureBoard = async ({ browser, board, outputPath = captureFileName(board.name) }) => {
  const page = await browser.newPage({ viewport: { width: board.width, height: board.height } });
  try {
    await page.goto(pathToFileURL(resolve(BOARD_DIR, board.file)).href);
    await page.addStyleTag({ content: FROZEN_CSS });
    // Why: the capture waits for the fonts, so no fallback font ends up in the PNG.
    await page.evaluate(() => globalThis.document.fonts.ready);
    await page.screenshot({ path: outputPath, fullPage: false });
  } finally {
    await page.close();
  }
  return outputPath;
};

const main = async () => {
  const canvas = JSON.parse(readFileSync(CANVAS_FILE, "utf8"));
  const boards = loadBoards(canvas);
  const requested = process.argv.slice(FIRST_ARG_INDEX);
  const resolved = resolveBoardNames({ requested, boards });
  if (resolved.error !== undefined) {
    process.stderr.write(`${resolved.error}\n`);
    return EXIT_USAGE;
  }
  mkdirSync("test-results/prototype", { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const name of resolved.names) {
      const board = boards.find((candidate) => candidate.name === name);
      const written = await captureBoard({ browser, board });
      process.stdout.write(`${written}\n`);
    }
  } finally {
    await browser.close();
  }
  return EXIT_OK;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await main());
}
