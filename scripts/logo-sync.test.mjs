import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = process.cwd();
const LOGO_SVG = readFileSync(join(ROOT, "design/logo/logo.svg"), "utf8");
const FAVICON_SVG = readFileSync(join(ROOT, "app/icon.svg"), "utf8");
const LOGO_ICON = readFileSync(join(ROOT, "components/Icons/LogoIcon.tsx"), "utf8");
const HEX_COLOR = /#[\da-f]{3,8}\b/iu;

const getPaths = (svg) => [...svg.matchAll(/ d="([^"]+)"/gu)].map((match) => match[1]);
const getConstant = (name) => LOGO_ICON.match(new RegExp(`${name} =\\s*"([^"]+)"`, "u"))?.[1];

describe("the logo sources", () => {
  it("LogoIcon draws the body and the accent of design/logo/logo.svg", () => {
    const [body, accent] = getPaths(LOGO_SVG);

    expect(getConstant("BODY_PATH")).toBe(body);
    expect(getConstant("ACCENT_PATH")).toBe(accent);
  });

  it("the favicon is the same drawing as design/logo/logo.svg", () => {
    expect(FAVICON_SVG).toBe(LOGO_SVG);
  });

  it("LogoIcon keeps a 6-unit margin around the drawing, so no stroke is cut at 24 px", () => {
    expect(LOGO_ICON).toContain('viewBox="-6 -6 324 482"');
  });

  it("LogoIcon has no literal color: the body is currentColor and the accent is the purple token", () => {
    expect(LOGO_ICON).not.toMatch(HEX_COLOR);
    expect(LOGO_ICON).toContain('fill="currentColor"');
    expect(LOGO_ICON).toContain('className="fill-purple"');
  });
});
