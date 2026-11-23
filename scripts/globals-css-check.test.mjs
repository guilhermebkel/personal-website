import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { findClassSelectors, hasFocusVisibleOutline, hasReducedMotionReset, findOutlineRemovals, findRawColorDeclarations, findMotionClassViolations, findMotionViolations } from "./globals-css-check.mjs";

const GLOBALS_CSS_PATH = fileURLToPath(new URL("../app/globals.css", import.meta.url));

const SOURCE_FOLDERS = ["../app", "../components"];

const listSourceFiles = (folder) => {
  return readdirSync(fileURLToPath(new URL(folder, import.meta.url)), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:tsx|ts|css)$/u.test(entry.name) && !entry.name.includes(".test."))
    // Why: components/ui/ is the registry's own output (it writes transition-all); the intermediates in components/ replace its transition, and those are scanned.
    .filter((entry) => !entry.parentPath.endsWith("/components/ui"))
    .map((entry) => `${entry.parentPath}/${entry.name}`);
};

describe("findClassSelectors()", () => {
  it("lists a class selector declared at the top level", () => {
    expect(findClassSelectors(".login-form { display: grid; }")).toStrictEqual(["login-form"]);
  });

  it("lists a class selector nested in a media query", () => {
    expect(findClassSelectors("@media (max-width: 640px) { .thread-inner { padding: 0; } }")).toStrictEqual(["thread-inner"]);
  });

  it("ignores dots in declaration values and comments", () => {
    const css = "/* .old-class { } */\nbody { line-height: 1.55; font-size: 0.9375rem; }";
    expect(findClassSelectors(css)).toStrictEqual([]);
  });

  it("lists a class selector in a selector list with a pseudo-class", () => {
    expect(findClassSelectors("a, .btn:hover { color: red; }")).toStrictEqual(["btn"]);
  });

  it("finds no class selector in the theme and the base styles", () => {
    expect(findClassSelectors("html, body { height: 100%; } button:focus-visible { outline: none; }")).toStrictEqual([]);
  });
});

describe("app/globals.css", () => {
  it("declares no class selector, so screen styles stay in their components", () => {
    const css = readFileSync(GLOBALS_CSS_PATH, "utf8");
    expect(findClassSelectors(css)).toStrictEqual([]);
  });

  it("keeps raw colors inside custom properties, so the theme owns every color", () => {
    const css = readFileSync(GLOBALS_CSS_PATH, "utf8");
    expect(findRawColorDeclarations(css)).toStrictEqual([]);
  });

  it("honors reduced motion", () => {
    const css = readFileSync(GLOBALS_CSS_PATH, "utf8");
    expect(hasReducedMotionReset(css)).toBe(true);
  });

  it("draws the focus ring and never removes an outline", () => {
    const css = readFileSync(GLOBALS_CSS_PATH, "utf8");
    expect(hasFocusVisibleOutline(css)).toBe(true);
    expect(findOutlineRemovals(css)).toStrictEqual([]);
  });
});

describe("findRawColorDeclarations()", () => {
  it("allows a raw color in a custom property", () => {
    expect(findRawColorDeclarations("@theme { --color-ink: oklch(0.23 0.02 212); --shadow-md: 0 1px 2px #000; }")).toStrictEqual([]);
  });

  it("allows colors derived from tokens", () => {
    expect(findRawColorDeclarations("a { color: color-mix(in oklch, var(--color-ink) 22%, transparent); }")).toStrictEqual([]);
  });

  it("lists a hex color in a declaration", () => {
    expect(findRawColorDeclarations("body { background: #fff; }")).toStrictEqual([{ selector: "body", property: "background", value: "#fff" }]);
  });

  it("lists an oklch color nested in a media query", () => {
    const css = "@media (min-width: 1px) { a { color: oklch(0.5 0.1 200); } }";
    expect(findRawColorDeclarations(css)).toStrictEqual([{ selector: "a", property: "color", value: "oklch(0.5 0.1 200)" }]);
  });
});

describe("findOutlineRemovals()", () => {
  it.each(["outline: none;", "outline: 0;", "outline: none !important;"])("lists %s", (declaration) => {
    expect(findOutlineRemovals(`button { ${declaration} }`)).toHaveLength(1);
  });

  it("allows an outline that draws a ring", () => {
    expect(findOutlineRemovals("a:focus-visible { outline: 2px solid var(--color-accent); }")).toStrictEqual([]);
  });
});

describe("hasFocusVisibleOutline()", () => {
  it("finds the ring", () => {
    expect(hasFocusVisibleOutline(":focus-visible { outline: 2px solid red; }")).toBe(true);
  });

  it("does not take a hover rule for a focus ring", () => {
    expect(hasFocusVisibleOutline("a:hover { outline: 2px solid red; }")).toBe(false);
  });
});

describe("hasReducedMotionReset()", () => {
  it("finds a reset that stops animations, transitions and smooth scrolling", () => {
    const css = "@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms; transition-duration: 0.01ms; scroll-behavior: auto; } }";
    expect(hasReducedMotionReset(css)).toBe(true);
  });

  it("rejects a reset that leaves transitions running", () => {
    expect(hasReducedMotionReset("@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms; } }")).toBe(false);
  });

  it("rejects a file with no reduced-motion query", () => {
    expect(hasReducedMotionReset("* { animation-duration: 0.01ms; transition-duration: 0.01ms; scroll-behavior: auto; }")).toBe(false);
  });
});

describe("motion rules", () => {
  it("keeps globals.css free of `all` and layout transitions", () => {
    const css = readFileSync(GLOBALS_CSS_PATH, "utf8");
    expect(findMotionViolations(css)).toStrictEqual([]);
  });

  it("writes no transition-all and no layout transition in a component", () => {
    const violations = SOURCE_FOLDERS.flatMap(listSourceFiles).flatMap((file) => findMotionClassViolations(readFileSync(file, "utf8")).map((found) => `${file}: ${found}`));
    expect(violations).toStrictEqual([]);
  });
});

describe("findMotionViolations()", () => {
  it.each([
    "transition: all 160ms ease-out;",
    "transition: width 160ms;",
    "transition: opacity 160ms, height 160ms;",
    "transition-property: margin-left;",
    "transition-property: all;",
  ])("lists %s", (declaration) => {
    expect(findMotionViolations(`a { ${declaration} }`)).toHaveLength(1);
  });

  it("allows listed properties that do not change the layout", () => {
    expect(findMotionViolations("a { transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast); }")).toStrictEqual([]);
  });

  it("finds a violation nested in a media query", () => {
    expect(findMotionViolations("@media (min-width: 1px) { a { transition: top 1s; } }")).toHaveLength(1);
  });

  it("does not take a custom property for a transition", () => {
    expect(findMotionViolations("@theme { --duration-fast: 160ms; --transition-all: 1; }")).toStrictEqual([]);
  });
});

describe("findMotionClassViolations()", () => {
  it.each(["transition-all", "hover:transition-all duration-fast", "transition-[width,opacity]", "transition-[margin-left]"])("lists %s", (classes) => {
    expect(findMotionClassViolations(`<div className="${classes}" />`)).toHaveLength(1);
  });

  it.each(["transition-colors", "transition-[opacity,transform]", "transition-[grid-template-columns]", "transition-[translate,visibility]", "transition-transform"])("allows %s", (classes) => {
    expect(findMotionClassViolations(`<div className="${classes}" />`)).toStrictEqual([]);
  });
});
