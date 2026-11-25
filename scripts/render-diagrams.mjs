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
      parseMMDOptions: { mermaidConfig, backgroundColor },
    });
    const svg = await readFile(output, "utf8");
    await writeFile(output, injectFontCss(svg, fontCss));
  } catch (error) {
    // Why: the error names the post, because a Mermaid message alone does not say which diagram of the posts is broken.
    throw new Error(`mermaid in post "${slug}": ${error.message}`, { cause: error });
  }
};

const renderAll = async () => {
  await rm(join(PUBLIC_DIRECTORY, "diagrams"), { recursive: true, force: true });
  const posts = [];
  for (const file of await listPostFiles()) {
    const slug = file.slice(0, -POST_EXTENSION.length);
    const markdown = await readFile(join(POSTS_DIRECTORY, file), "utf8");
    for (const diagram of MermaidUtil.listDiagrams(markdown)) {
      posts.push({ slug, diagram });
    }
  }
  if (posts.length === 0) {
    process.stdout.write("render-diagrams: no Mermaid block in the posts.\n");
    return;
  }
  // Why: the browser that draws the diagrams is the one the end-to-end tests use; it is installed only when a post needs it.
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
    for (const [index, { slug, diagram }] of posts.entries()) {
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
  process.stdout.write(`render-diagrams: ${posts.length} diagram(s) rendered.\n`);
};

const isMain = () => process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  renderAll().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
