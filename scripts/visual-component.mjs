import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ensurePlaywrightChromium } from "./ensure-playwright.mjs";

export const CAPTURE_DIR = "test-results/visual";
export const VISUAL_CONFIG = "vitest.visual.config.mjs";
export const USAGE = "Usage: pnpm visual:component <file>";

export const EXIT_OK = 0;
export const EXIT_FAILED = 1;
export const EXIT_USAGE = 2;
// Why: argv holds the node binary and the script path before the user arguments.
const FIRST_ARG_INDEX = 2;

// Why: pure, so the tests need no files or browser. the one argument is the render file; anything else is a usage error.
export const parseVisualArgs = (argv) => {
  if (argv.length === 0) {
    return { error: USAGE };
  }
  return { file: argv[0] };
};

// Why: pure, so the tests need no files or browser. the PNGs written at or after `sinceMs`, so a run lists only its own captures.
export const listFreshPngs = ({ entries, sinceMs }) => {
  return entries
    .filter((entry) => entry.name.endsWith(".png") && entry.mtimeMs >= sinceMs)
    .map((entry) => entry.path)
    .sort();
};

export const buildNoCaptureMessage = (file) => `No capture came from ${file}`;

const readCaptureEntries = (directory) => {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory).map((name) => {
    const path = join(directory, name);
    return { name, path, mtimeMs: statSync(path).mtimeMs };
  });
};

const runRender = (file) => {
  const result = spawnSync("pnpm", ["exec", "vitest", "run", "--config", VISUAL_CONFIG, file], { stdio: "inherit" });
  return result.status ?? EXIT_FAILED;
};

const runVisualComponent = () => {
  const parsed = parseVisualArgs(process.argv.slice(FIRST_ARG_INDEX));
  if (parsed.error !== undefined) {
    process.stderr.write(`${parsed.error}\n`);
    return EXIT_USAGE;
  }
  if (!existsSync(parsed.file)) {
    process.stderr.write(`${buildNoCaptureMessage(parsed.file)}: the render file does not exist.\n`);
    return EXIT_FAILED;
  }
  if (ensurePlaywrightChromium() !== 0) {
    process.stderr.write("Chromium is not installed and could not be installed.\n");
    return EXIT_FAILED;
  }
  const startedAt = Date.now();
  const renderStatus = runRender(parsed.file);
  const written = listFreshPngs({ entries: readCaptureEntries(CAPTURE_DIR), sinceMs: startedAt });
  if (written.length === 0) {
    process.stderr.write(`${buildNoCaptureMessage(parsed.file)}\n`);
    return EXIT_FAILED;
  }
  for (const path of written) {
    process.stdout.write(`${path}\n`);
  }
  return renderStatus === EXIT_OK ? EXIT_OK : renderStatus;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(runVisualComponent());
}
