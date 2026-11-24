import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

// Why: the icons are drawn from the same paths as the logo (design/logo/logo.svg) and the colors of the tokens, so they cannot drift from the site.
const ROOT = process.cwd();
const LOGO_WIDTH = 312;
const LOGO_HEIGHT = 470;
const MARK_HEIGHT_SHARE = 0.62;
const HALF = 0.5;
const DECIMALS = 2;
const SCALE_DECIMALS = 5;
const APP_SIZES = [
  { file: "public/icon-192.png", size: 192 },
  { file: "public/icon-512.png", size: 512 },
  { file: "app/apple-icon.png", size: 180 },
];
const FAVICON_SIZE = 32;
const ICON_SVG_SIZE = 512;

export const readTokenColor = (tokens, name) => {
  const token = tokens.color.tokens.find((candidate) => candidate.name === name);
  if (token === undefined) {
    throw new Error(`build-icons: no color token named "${name}"`);
  }
  return token.value;
};

export const buildIconSvg = ({ logoSvg, background, body, accent, size }) => {
  const scale = (size * MARK_HEIGHT_SHARE) / LOGO_HEIGHT;
  const offsetX = (size - LOGO_WIDTH * scale) * HALF;
  const offsetY = (size - LOGO_HEIGHT * scale) * HALF;
  const paths = [...logoSvg.matchAll(/ d="([^"]+)"/gu)].map((match) => match[1]);
  // Why: the body takes the text-strong token and the arrow the purple token, the same two roles as the navbar logo.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<rect width="${size}" height="${size}" fill="${background}"/>`,
    `<g transform="translate(${offsetX.toFixed(DECIMALS)} ${offsetY.toFixed(DECIMALS)}) scale(${scale.toFixed(SCALE_DECIMALS)})">`,
    `<path d="${paths[0]}" fill="${body}"/>`,
    `<path d="${paths[1]}" fill="${accent}"/>`,
    "</g>",
    "</svg>",
  ].join("");
};

const ICO_HEADER_BYTES = 6;
const ICO_ENTRY_BYTES = 16;
const ICO_TYPE_ICON = 1;
const ICO_PLANES = 1;
const ICO_BITS_PER_PIXEL = 32;
const ICO_SIZE_FIELD = 8;
const ICO_OFFSET_FIELD = 12;
const ICO_BIT_COUNT_FIELD = 6;
const ICO_PLANES_FIELD = 4;
const ICO_TYPE_FIELD = 2;
const ICO_COUNT_FIELD = 4;

export const buildIcoFile = (png, size) => {
  // Why: an .ico with one PNG inside (the format since Windows Vista) keeps the 32 px icon in a single lossless image.
  const header = Buffer.alloc(ICO_HEADER_BYTES);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(ICO_TYPE_ICON, ICO_TYPE_FIELD);
  header.writeUInt16LE(1, ICO_COUNT_FIELD);
  const entry = Buffer.alloc(ICO_ENTRY_BYTES);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(ICO_PLANES, ICO_PLANES_FIELD);
  entry.writeUInt16LE(ICO_BITS_PER_PIXEL, ICO_BIT_COUNT_FIELD);
  entry.writeUInt32LE(png.length, ICO_SIZE_FIELD);
  entry.writeUInt32LE(header.length + entry.length, ICO_OFFSET_FIELD);
  return Buffer.concat([header, entry, png]);
};

const renderPng = async (browser, svg, size) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  // Why: a canvas exports PNG with an alpha channel (RGBA), which the .ico decoder of Next requires; a screenshot of an opaque page is RGB.
  // Why: the drawing runs in the page as text, so the browser globals are not read by the linter of this Node script.
  const drawing = `(async () => {
    const image = new Image(${size}, ${size});
    image.src = "data:image/svg+xml;base64," + btoa(${JSON.stringify(svg)});
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = ${size};
    canvas.height = ${size};
    canvas.getContext("2d").drawImage(image, 0, 0, ${size}, ${size});
    return canvas.toDataURL("image/png");
  })()`;
  const dataUrl = await page.evaluate(drawing);
  await page.close();
  return Buffer.from(dataUrl.split(",")[1], "base64");
};

export const writeIcons = async ({ root, executablePath }) => {
  const tokensText = readFileSync(join(root, "design/system/tokens.json"), "utf8");
  const tokens = JSON.parse(tokensText);
  const logoSvg = readFileSync(join(root, "design/logo/logo.svg"), "utf8");
  const colors = {
    background: readTokenColor(tokens, "graphite"),
    body: readTokenColor(tokens, "text-strong"),
    accent: readTokenColor(tokens, "purple"),
  };
  mkdirSync(join(root, "public"), { recursive: true });
  const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
  try {
    for (const target of APP_SIZES) {
      const svg = buildIconSvg({ logoSvg, ...colors, size: target.size });
      writeFileSync(join(root, target.file), await renderPng(browser, svg, target.size));
    }
    const faviconSvg = buildIconSvg({ logoSvg, ...colors, size: FAVICON_SIZE });
    const favicon = await renderPng(browser, faviconSvg, FAVICON_SIZE);
    writeFileSync(join(root, "app/favicon.ico"), buildIcoFile(favicon, FAVICON_SIZE));
    // Why: the browser tab icon is the same mark on the graphite ground, because on a light browser UI the light body of the bare mark disappears.
    writeFileSync(join(root, "app/icon.svg"), buildIconSvg({ logoSvg, ...colors, size: ICON_SVG_SIZE }));
  } finally {
    await browser.close();
  }
};

const isMain = () => process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  // Why: the browser path is given on the command line, so the script reads no environment variable.
  const executablePath = process.argv[2];
  await writeIcons({ root: ROOT, executablePath });
  process.stdout.write(
    "build-icons: wrote public/icon-192.png, public/icon-512.png, app/apple-icon.png, app/favicon.ico\n",
  );
}
