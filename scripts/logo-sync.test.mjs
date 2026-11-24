import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = process.cwd();
const LOGO_SVG = readFileSync(join(ROOT, "design/logo/logo.svg"), "utf8");
const FAVICON_SVG = readFileSync(join(ROOT, "app/icon.svg"), "utf8");
const LOGO_ICON = readFileSync(join(ROOT, "components/Icons/LogoIcon.tsx"), "utf8");
const BOARD = readFileSync(join(ROOT, "design/prototype/LogoRound.dc.html"), "utf8");
const GRAPHITE = "#1b1b1e";
const VIEW_BOX = 'viewBox="-6 -6 324 482"';
const HEX_COLOR = /#[\da-f]{3,8}\b/iu;

const getPaths = (svg) => [...svg.matchAll(/ d="([^"]+)"/gu)].map((match) => match[1]);
const getConstant = (name) => LOGO_ICON.match(new RegExp(`${name} =\\s*"([^"]+)"`, "u"))?.[1];

describe("the logo sources", () => {
  it("LogoIcon draws the body and the accent of design/logo/logo.svg", () => {
    const [body, accent] = getPaths(LOGO_SVG);

    expect(getConstant("BODY_PATH")).toBe(body);
    expect(getConstant("ACCENT_PATH")).toBe(accent);
  });

  it("the favicon draws the same two paths as design/logo/logo.svg, on the graphite ground", () => {
    const [body, accent] = getPaths(LOGO_SVG);

    expect(FAVICON_SVG).toContain(`d="${body}"`);
    expect(FAVICON_SVG).toContain(`d="${accent}"`);
    expect(FAVICON_SVG).toContain(`fill="${GRAPHITE}"`);
  });

  it("LogoIcon keeps a 6-unit margin around the drawing, so no stroke is cut at 24 px", () => {
    expect(LOGO_ICON).toContain(VIEW_BOX);
  });

  it("LogoIcon has no literal color: the body is currentColor and the accent is the purple token", () => {
    expect(LOGO_ICON).not.toMatch(HEX_COLOR);
    expect(LOGO_ICON).toContain('fill="currentColor"');
    expect(LOGO_ICON).toContain('className="fill-purple"');
  });

  it("the board LogoRound draws the same two paths as LogoIcon, at the same viewBox", () => {
    const boardPaths = [...new Set(getPaths(BOARD))];

    expect(boardPaths).toContain(getConstant("BODY_PATH"));
    expect(boardPaths).toContain(getConstant("ACCENT_PATH"));
    expect(BOARD).toContain(VIEW_BOX);
    expect(LOGO_ICON).toContain(VIEW_BOX);
  });
});
