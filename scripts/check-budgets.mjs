import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { pathToFileURL } from "node:url";

const BYTES_PER_KIB = 1024;
// Why: the home page's JavaScript, gzipped, stays under this; a raise needs an ADR line in docs/harness-standards.md.
const SCRIPT_BUDGET_KIB = 210;
export const SCRIPT_BUDGET_BYTES = SCRIPT_BUDGET_KIB * BYTES_PER_KIB;

const SCRIPT_SOURCE = /<script[^>]*\ssrc="([^"]+)"/gu;
const STYLESHEET = /<link[^>]*\brel="stylesheet"[^>]*\shref="([^"]+)"/gu;
const FONT_FACE = /@font-face\s*\{([^}]*)\}/gu;
const FIRST_URL = /url\(["']?([^"')]+)/u;
const WOFF2_SUFFIX = ".woff2";

export const collectScriptSources = (html) => [...html.matchAll(SCRIPT_SOURCE)].map((match) => match[1]);

export const collectStylesheetSources = (html) => [...html.matchAll(STYLESHEET)].map((match) => match[1]);

const computeTotal = (sizesByPath) => Object.values(sizesByPath).reduce((sum, size) => sum + size, 0);

export const findOverBudget = ({ sizesByPath, budget }) => {
  // Why: the sizes are summed first, so the budget is for the page as a whole, not for each file.
  const total = computeTotal(sizesByPath);
  return total > budget ? { total, budget } : undefined;
};

export const findFontFaceProblems = (css) => {
  // Why: each @font-face must load woff2 first (the smallest format a browser reads) and name a unicode-range, so the file is a subset of one script.
  return [...css.matchAll(FONT_FACE)].flatMap((match) => {
    const block = match[1];
    const firstUrl = FIRST_URL.exec(block)?.[1] ?? "";
    const problems = [];
    if (!firstUrl.endsWith(WOFF2_SUFFIX)) {
      problems.push(`first format is not woff2: ${firstUrl || "(no url)"}`);
    }
    if (!block.includes("unicode-range")) {
      problems.push(`no unicode-range (not a subset): ${firstUrl || "(no url)"}`);
    }
    return problems;
  });
};

const readGzipSize = (path) => gzipSync(readFileSync(path)).length;

const isMain = () => {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
};

if (isMain()) {
  const root = join(process.cwd(), "out");
  const html = readFileSync(join(root, "index.html"), "utf8");
  const scripts = collectScriptSources(html);
  const sizesByPath = Object.fromEntries(scripts.map((source) => [source, readGzipSize(join(root, source))]));
  const over = findOverBudget({ sizesByPath, budget: SCRIPT_BUDGET_BYTES });
  const fontProblems = collectStylesheetSources(html).flatMap((source) => {
    const css = readFileSync(join(root, source), "utf8");
    return findFontFaceProblems(css);
  });
  const total = computeTotal(sizesByPath);
  process.stdout.write(
    `check-budgets: ${scripts.length} scripts on /, ${total} bytes gzip (budget ${SCRIPT_BUDGET_BYTES}).\n`,
  );
  if (over !== undefined) {
    process.stderr.write(`over the script budget: ${over.total} bytes gzip > ${over.budget}\n`);
  }
  for (const problem of fontProblems) {
    process.stderr.write(`font: ${problem}\n`);
  }
  if (over !== undefined || fontProblems.length > 0) {
    process.exit(1);
  }
}
