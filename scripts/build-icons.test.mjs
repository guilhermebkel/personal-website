import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { buildIcoFile, buildIconSvg, readTokenColor } from "./build-icons.mjs";

const ROOT = process.cwd();
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const ICO_HEADER_BYTES = 6;
const ICO_ENTRY_BYTES = 16;
const PNG_COLOR_TYPE_OFFSET = 25;
const RGBA_COLOR_TYPE = 6;

const readPng = (path) => readFileSync(join(ROOT, path));
const readPngSize = (path) => {
  const buffer = readPng(path);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
};
const tokensText = readFileSync(join(ROOT, "design/system/tokens.json"), "utf8");
const TOKENS = JSON.parse(tokensText);

describe("the icon files", () => {
  it("public/icon-192.png and public/icon-512.png are the sizes the manifest names", () => {
    expect(readPngSize("public/icon-192.png")).toStrictEqual({ width: 192, height: 192 });
    expect(readPngSize("public/icon-512.png")).toStrictEqual({ width: 512, height: 512 });
  });

  it("app/apple-icon.png is 180 px, the apple touch size", () => {
    expect(readPngSize("app/apple-icon.png")).toStrictEqual({ width: 180, height: 180 });
  });

  it("app/favicon.ico holds one 32 px PNG", () => {
    const ico = readPng("app/favicon.ico");
    const count = ico.readUInt16LE(4);
    const width = ico.readUInt8(ICO_HEADER_BYTES);
    const height = ico.readUInt8(ICO_HEADER_BYTES + 1);
    const offset = ico.readUInt32LE(ICO_HEADER_BYTES + 12);

    expect(count).toBe(1);
    expect(width).toBe(32);
    expect(height).toBe(32);
    expect(ico.subarray(offset, offset + PNG_SIGNATURE.length).equals(PNG_SIGNATURE)).toBe(true);
    expect(offset).toBe(ICO_HEADER_BYTES + ICO_ENTRY_BYTES);
    expect(ico.readUInt8(offset + PNG_COLOR_TYPE_OFFSET)).toBe(RGBA_COLOR_TYPE);
  });
});

describe("buildIcoFile()", () => {
  it("writes the header, one entry and the PNG after them", () => {
    const png = Buffer.concat([PNG_SIGNATURE, Buffer.alloc(4)]);
    const ico = buildIcoFile(png, 32);

    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt32LE(ICO_HEADER_BYTES + 8)).toBe(png.length);
    expect(ico.subarray(ICO_HEADER_BYTES + ICO_ENTRY_BYTES).equals(png)).toBe(true);
  });
});

describe("buildIconSvg()", () => {
  it("draws the logo paths on the graphite background with the body and purple accent tokens", () => {
    const logo = readFileSync(join(ROOT, "design/logo/logo.svg"), "utf8");
    const svg = buildIconSvg({
      logoSvg: logo,
      background: readTokenColor(TOKENS, "graphite"),
      body: readTokenColor(TOKENS, "text-strong"),
      accent: readTokenColor(TOKENS, "purple"),
      size: 512,
    });

    expect(svg).toContain('fill="#1b1b1e"');
    expect(svg).toContain('fill="#f2f2f2"');
    expect(svg).toContain('fill="#5328fe"');
  });
});

describe("readTokenColor()", () => {
  it("fails on a token name that is not in tokens.json", () => {
    expect(() => readTokenColor(TOKENS, "not-a-token")).toThrow('no color token named "not-a-token"');
  });
});
