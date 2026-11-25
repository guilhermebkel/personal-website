import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildFontCss } from "./render-diagrams.mjs";

// Why: a post cover is an SVG drawn from the tokens, so it takes the same colors as the site and never needs an image editor.
const ROOT = process.cwd();
const WIDTH = 800;
const HEIGHT = 380;
const LINE_COUNT = 9;
const WAVE_AMPLITUDE = 22;
const WAVE_STEPS = 4;
const PHASE_DIVISOR = 1000;
// Why: the cover is cropped to fill each frame (about 2.7:1 on the post, 1.75:1 on a card), so the title sits in the middle area that every crop keeps.
const TITLE_X = 80;
const TITLE_Y = 200;
const TITLE_SIZE = 40;
const TITLE_LINE_LENGTH = 26;
const TITLE_MAX_LINES = 2;
const TITLE_FONT = "Ubuntu, sans-serif";
const TITLE_WEIGHT = 500;
const TURNS = 2;
const TWO_PI = Math.PI * TURNS;
const HASH_BASE = 31;
const ARGUMENTS_OFFSET = 2;
const FIRST_INDEX = 0;
const HALF = 0.5;
const DECIMALS = 2;

export const readTokenColor = (tokens, name) => {
  const token = tokens.color.tokens.find((candidate) => candidate.name === name);
  if (token === undefined) {
    throw new Error(`render-cover: no color token named "${name}"`);
  }
  return token.value;
};

export const readPhase = (topic) => {
  // Why: the phase comes from the topic, so two covers with different topics wave differently, as the site's covers do.
  let hash = FIRST_INDEX;
  for (const character of topic) {
    hash = (hash * HASH_BASE + character.codePointAt(FIRST_INDEX)) % PHASE_DIVISOR;
  }
  return (hash / PHASE_DIVISOR) * TWO_PI;
};

const buildWavePath = (line, phase) => {
  const baseY = ((line + HALF) / LINE_COUNT) * HEIGHT;
  const points = [];
  for (let step = 0; step <= WAVE_STEPS; step += 1) {
    const pointX = (step / WAVE_STEPS) * WIDTH;
    const pointY = baseY + Math.sin(phase + step + line) * WAVE_AMPLITUDE;
    points.push(`${pointX.toFixed(DECIMALS)} ${pointY.toFixed(DECIMALS)}`);
  }
  return `M${points.join(" L")}`;
};

export const wrapTitle = (title) => {
  // Why: the title is wrapped by words, because an SVG text does not wrap by itself.
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current === "" ? word : `${current} ${word}`;
    if (candidate.length > TITLE_LINE_LENGTH && current !== "") {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current !== "") {
    lines.push(current);
  }
  // Why: a title that does not fit used to lose its last words without a warning, so the cover now fails and asks for a shorter one.
  if (lines.length > TITLE_MAX_LINES) {
    throw new Error(
      `render-cover: the title needs ${lines.length} lines of up to ${TITLE_LINE_LENGTH} characters, and the cover holds ${TITLE_MAX_LINES}`,
    );
  }
  return lines;
};

const escapeText = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const buildCoverSvg = ({ title, topic, tokens }) => {
  const ground = readTokenColor(tokens, "graphite");
  const line = readTokenColor(tokens, "text-meta");
  const accent = readTokenColor(tokens, "purple");
  const phase = readPhase(topic);
  const waves = Array.from({ length: LINE_COUNT }, (_, index) => {
    const stroke = index === Math.floor(LINE_COUNT * HALF) ? accent : line;
    return `<path d="${buildWavePath(index, phase)}" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
  });
  const titleLines = wrapTitle(title).map(
    (text, index) =>
      `<text x="${TITLE_X}" y="${TITLE_Y + index * TITLE_SIZE}" font-family="${TITLE_FONT}" font-weight="${TITLE_WEIGHT}" font-size="${TITLE_SIZE}" fill="${escapeText(readTokenColor(tokens, "text-strong"))}">${escapeText(text)}</text>`,
  );
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    // Why: a cover is shown as a picture, which cannot load the page's fonts, so the site's Ubuntu is embedded in the file.
    `<defs><style>${buildFontCss()}</style></defs>`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${ground}"/>`,
    ...waves,
    ...titleLines,
    "</svg>",
  ].join("");
};

const isMain = () => process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  // Why: the title, the topic and the output name are arguments, so the script reads no environment variable.
  const [title, topic, output] = process.argv.slice(ARGUMENTS_OFFSET);
  const tokensPath = join(ROOT, "design/system/tokens.json");
  const tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  const outputPath = join(ROOT, output);
  const svg = buildCoverSvg({ title, topic, tokens });
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, svg);
  process.stdout.write(`render-cover: wrote ${output}\n`);
}
