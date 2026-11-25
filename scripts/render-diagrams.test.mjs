import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MermaidUtil } from "../src/Utils/MermaidUtil.ts";
import { buildMeasureFontCss, buildMermaidConfig, injectFontCss, planDiagrams } from "./render-diagrams.mjs";

const TOKENS = {
  color: {
    tokens: [
      { name: "surface", value: "#282828" },
      { name: "text", value: "#ffffff" },
      { name: "purple-light", value: "#9479ff" },
      { name: "raised", value: "#202024" },
      { name: "panel", value: "#252525" },
      { name: "text-muted", value: "#aaaaaa" },
      { name: "text-soft", value: "#d7d7d7" },
      { name: "graphite", value: "#1b1b1e" },
      { name: "line", value: "#5b5b5b" },
      { name: "cover", value: "#232327" },
    ],
  },
};

describe("buildMermaidConfig()", () => {
  it("takes the diagram colors from the tokens", () => {
    const {
      mermaidConfig: { themeVariables },
    } = buildMermaidConfig(TOKENS);

    expect(themeVariables.primaryColor).toBe("#282828");
    expect(themeVariables.primaryBorderColor).toBe("#9479ff");
    expect(themeVariables.lineColor).toBe("#aaaaaa");
  });

  it("fails naming the token when a color the diagrams need is missing", () => {
    const tokens = { color: { tokens: TOKENS.color.tokens.filter((token) => token.name !== "line") } };

    expect(() => buildMermaidConfig(tokens)).toThrow('no color token named "line"');
  });

  it("draws the diagram on the cover token, the ground of a post figure", () => {
    expect(buildMermaidConfig(TOKENS).backgroundColor).toBe("#232327");
  });
});

describe("injectFontCss()", () => {
  it("declares the font at the root of the SVG, after its opening tag", () => {
    const svg = injectFontCss('<svg id="my-svg" width="100%"><style>#my-svg{}</style></svg>', "@font-face{}");

    expect(svg).toContain('<svg id="my-svg" width="100%"><defs><style>@font-face{}</style></defs>');
  });

  it("fails when there is no svg to receive the font", () => {
    expect(() => injectFontCss("<html></html>", "@font-face{}")).toThrow("no <svg> element");
  });
});

describe("buildMeasureFontCss()", () => {
  it("points Mermaid's page at the Ubuntu style sheets, so the boxes are measured in the font they are drawn in", () => {
    const styleSheets = buildMeasureFontCss();

    expect(styleSheets.length).toBeGreaterThan(0);
    for (const { cssUrl } of styleSheets) {
      const cssPath = fileURLToPath(cssUrl);
      expect(existsSync(cssPath)).toBe(true);
    }
  });
});

describe("planDiagrams()", () => {
  const diagram = { slug: "post", diagram: { source: "flowchart TD\n  A --> B\n", alt: "Diagram" } };
  const committedPath = MermaidUtil.buildPublicPath("post", diagram.diagram.source);

  it("draws nothing when every diagram already has its committed file", () => {
    expect(planDiagrams([diagram], new Set([committedPath]))).toStrictEqual({ missing: [], stale: [] });
  });

  it("draws a diagram whose file is missing, as after an edit changes its hash", () => {
    expect(planDiagrams([diagram], new Set()).missing).toStrictEqual([diagram]);
  });

  it("lists a file no post uses any more as stale", () => {
    expect(planDiagrams([], new Set(["/diagrams/old/abc.svg"])).stale).toStrictEqual(["/diagrams/old/abc.svg"]);
  });
});
