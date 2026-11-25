import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { MermaidUtil } from "../src/Utils/MermaidUtil.ts";

const POST_EXTENSION = ".md";
const POSTS_DIRECTORY = join(process.cwd(), "content", "posts");
const PUBLIC_DIRECTORY = join(process.cwd(), "public");
const TOKENS_FILE = join(process.cwd(), "design", "system", "tokens.json");
const SOURCE_EXTENSION = ".mmd";
const NO_SANDBOX_ARG = "--no-sandbox";
const SVG_OPENING_TAG = /<svg\b[^>]*>/u;

const FONT_FILES = [
  { weight: 400, file: "ubuntu-latin-400-normal.woff2" },
  { weight: 500, file: "ubuntu-latin-500-normal.woff2" },
];
const FONT_DIRECTORY = join(process.cwd(), "node_modules", "@fontsource", "ubuntu", "files");
const FONT_FAMILY = "Ubuntu";
const MEASURE_FONT_CSS_FILES = ["latin-400.css", "latin-500.css"];

export const buildMeasureFontCss = () => {
  // Why: Mermaid sizes each box from the text width in its own page, so that page must load Ubuntu too; measured with a fallback font, the boxes come out narrower than the embedded Ubuntu and the last letters are cut.
  return MEASURE_FONT_CSS_FILES.map((file) => {
    const cssPath = join(process.cwd(), "node_modules", "@fontsource", "ubuntu", file);
    return { cssUrl: pathToFileURL(cssPath), allowParentDirectoryLevel: 0 };
  });
};

export const buildFontCss = () => {
  // Why: an SVG shown as a picture cannot load the page's fonts, so the site's Ubuntu (latin, regular and medium) is embedded in the file.
  return FONT_FILES.map(({ weight, file }) => {
    const data = readFileSync(join(FONT_DIRECTORY, file)).toString("base64");
    return `@font-face{font-family:"${FONT_FAMILY}";font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${data}) format("woff2");}`;
  }).join("");
};

export const buildMermaidConfig = (tokens) => {
  // Why: a diagram is drawn with the site's own colors and font, so a change to tokens.json or to the font changes the diagrams too.
  const colors = Object.fromEntries(tokens.color.tokens.map((token) => [token.name, token.value]));
  const readColor = (name) => {
    if (colors[name] === undefined) {
      throw new Error(`diagram theme: no color token named "${name}" in tokens.json`);
    }
    return colors[name];
  };
  return {
    backgroundColor: readColor("cover"),
    mermaidConfig: {
      theme: "base",
      // Why: the neo look adds a light drop shadow to every shape, which reads as a white halo on the dark ground; the classic look is flat, as the site is.
      look: "classic",
      themeVariables: {
        fontFamily: `${FONT_FAMILY}, sans-serif`,
        primaryColor: readColor("surface"),
        primaryTextColor: readColor("text"),
        primaryBorderColor: readColor("purple-light"),
        secondaryColor: readColor("raised"),
        tertiaryColor: readColor("panel"),
        mainBkg: readColor("surface"),
        nodeBorder: readColor("purple-light"),
        lineColor: readColor("text-muted"),
        textColor: readColor("text-soft"),
        clusterBkg: readColor("panel"),
        clusterBorder: readColor("line"),
        edgeLabelBackground: readColor("cover"),
        titleColor: readColor("text"),
        noteBkgColor: readColor("surface"),
        noteTextColor: readColor("text-soft"),
        noteBorderColor: readColor("line"),
      },
    },
  };
};

const listPostFiles = async () => {
  const names = await readdir(POSTS_DIRECTORY);
  return names.filter((name) => name.endsWith(POST_EXTENSION));
};

export const injectFontCss = (svg, fontCss) => {
  // Why: Mermaid drops @font-face rules from its own style sheet, so the font is declared once more at the root of the finished SVG.
  const opening = svg.match(SVG_OPENING_TAG);
  if (opening === null) {
    throw new Error("diagram output has no <svg> element to receive the font");
  }
  return svg.replace(SVG_OPENING_TAG, `${opening[0]}<defs><style>${fontCss}</style></defs>`);
};

const renderDiagram = async ({
  run,
  puppeteerConfig,
  mermaidConfig,
  backgroundColor,
  fontCss,
  workDirectory,
  slug,
  diagram,
  index,
}) => {
  const source = join(workDirectory, `${slug}-${index}${SOURCE_EXTENSION}`);
  const output = join(PUBLIC_DIRECTORY, MermaidUtil.buildPublicPath(slug, diagram.source));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(source, diagram.source);
  try {
    await run(source, output, {
      puppeteerConfig,
      quiet: true,
      parseMMDOptions: { mermaidConfig, backgroundColor, customFontCSS: buildMeasureFontCss(), fontEmbed: false },
    });
    const svg = await readFile(output, "utf8");
    await writeFile(output, injectFontCss(svg, fontCss));
  } catch (error) {
    // Why: the error names the post, because a Mermaid message alone does not say which diagram of the posts is broken.
    throw new Error(`mermaid in post "${slug}": ${error.message}`, { cause: error });
  }
};

const DIAGRAMS_DIRECTORY = join(PUBLIC_DIRECTORY, "diagrams");
const CHECK_FLAG = "--check";

export const planDiagrams = (diagrams, existingFiles) => {
  // Why: the SVGs are committed, so a build draws only the diagrams whose file is missing and removes the ones no post uses any more.
  const pathToDiagram = new Map();
  for (const entry of diagrams) {
    pathToDiagram.set(MermaidUtil.buildPublicPath(entry.slug, entry.diagram.source), entry);
  }
  const missing = [...pathToDiagram].filter(([path]) => !existingFiles.has(path)).map(([, entry]) => entry);
  const stale = [...existingFiles].filter((path) => !pathToDiagram.has(path));
  return { missing, stale };
};

const listExistingFiles = async () => {
  if (!existsSync(DIAGRAMS_DIRECTORY)) {
    return new Set();
  }
  const files = await readdir(DIAGRAMS_DIRECTORY, { recursive: true });
  const svgFiles = files.filter((file) => file.endsWith(".svg"));
  return new Set(svgFiles.map((file) => `/diagrams/${file.split("\\").join("/")}`));
};

const listDiagrams = async () => {
  const diagrams = [];
  for (const file of await listPostFiles()) {
    const slug = file.slice(0, -POST_EXTENSION.length);
    const markdown = await readFile(join(POSTS_DIRECTORY, file), "utf8");
    for (const diagram of MermaidUtil.listDiagrams(markdown)) {
      diagrams.push({ slug, diagram });
    }
  }
  return diagrams;
};

const renderMissing = async (missing) => {
  // Why: the browser that draws the diagrams is the one the end-to-end tests use; it is installed only when a diagram must be drawn, so a host without it (Vercel) builds from the committed files.
  if (!existsSync(chromium.executablePath())) {
    spawnSync("pnpm", ["ensure-playwright"], { stdio: "inherit" });
  }
  const { run } = await import("@mermaid-js/mermaid-cli");
  const tokens = JSON.parse(await readFile(TOKENS_FILE, "utf8"));
  const puppeteerConfig = { executablePath: chromium.executablePath(), args: [NO_SANDBOX_ARG] };
  const { mermaidConfig, backgroundColor } = buildMermaidConfig(tokens);
  const fontCss = buildFontCss();
  const systemTemp = tmpdir();
  const workDirectory = await mkdtemp(join(systemTemp, "diagrams-"));
  try {
    for (const [index, { slug, diagram }] of missing.entries()) {
      await renderDiagram({
        run,
        puppeteerConfig,
        mermaidConfig,
        backgroundColor,
        fontCss,
        workDirectory,
        slug,
        diagram,
        index,
      });
    }
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
};

const renderAll = async ({ isCheck }) => {
  const diagrams = await listDiagrams();
  const existingFiles = await listExistingFiles();
  const { missing, stale } = planDiagrams(diagrams, existingFiles);
  if (isCheck) {
    if (missing.length > 0 || stale.length > 0) {
      throw new Error(
        `render-diagrams: ${missing.length} diagram(s) not drawn and ${stale.length} unused file(s) in public/diagrams; run pnpm diagrams and commit public/diagrams`,
      );
    }
    process.stdout.write(`render-diagrams: ${diagrams.length} diagram(s), every file committed.\n`);
    return;
  }
  for (const path of stale) {
    await rm(join(PUBLIC_DIRECTORY, path), { force: true });
  }
  if (missing.length > 0) {
    await renderMissing(missing);
  }
  process.stdout.write(
    `render-diagrams: ${missing.length} drawn, ${diagrams.length - missing.length} already committed, ${stale.length} removed.\n`,
  );
};

const isMain = () => process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  renderAll({ isCheck: process.argv.includes(CHECK_FLAG) }).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
