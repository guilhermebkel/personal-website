import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildTokensCss } from "./build-design-tokens.mjs";
import { buildContrastMarkdown, buildContrastRows } from "./contrast-report.mjs";

const SOURCE = new URL("../design/system/tokens.json", import.meta.url);
const GENERATED = new URL("../design/system/tokens.css", import.meta.url);
const PAIRS = new URL("../design/system/contrast-pairs.json", import.meta.url);
const CONTRAST = new URL("../design/system/CONTRAST.md", import.meta.url);
const PURPLE = "#5328fe";

const MINI_TOKENS = {
  color: { tokens: [{ name: "purple", value: PURPLE, usage: "Brand." }] },
  type: {
    families: { sans: "Ubuntu" },
    styles: [{ name: "body", fontSize: "16px", lineHeight: "24px" }],
  },
  radius: { tokens: [{ name: "sm", value: "8px" }] },
  layout: { tokens: [{ name: "navbar", type: "spacing", value: "64px" }] },
};

describe("buildTokensCss()", () => {
  it("writes each kind of token under its Tailwind theme name", () => {
    const css = buildTokensCss(MINI_TOKENS);

    expect(css).toContain(`--color-purple: ${PURPLE};  /* Brand. */`);
    expect(css).toContain("--font-sans: Ubuntu;");
    expect(css).toContain("--text-body: 16px;");
    expect(css).toContain("--text-body--line-height: 24px;");
    expect(css).toContain("--radius-sm: 8px;");
    expect(css).toContain("--spacing-navbar: 64px;");
  });

  it("resets the default scales so only our names exist", () => {
    const css = buildTokensCss(MINI_TOKENS);

    expect(css).toContain("--color-*: initial;");
    expect(css).toContain("--text-*: initial;");
    expect(css).toContain("--radius-*: initial;");
  });

  it("keeps tokens.css in step with tokens.json", () => {
    const tokens = JSON.parse(readFileSync(SOURCE, "utf8"));
    const generated = readFileSync(GENERATED, "utf8");

    expect(generated).toBe(buildTokensCss(tokens));
  });

  it("keeps CONTRAST.md in step with the color pairs", () => {
    const tokens = JSON.parse(readFileSync(SOURCE, "utf8"));
    const pairs = JSON.parse(readFileSync(PAIRS, "utf8"));
    const generated = readFileSync(CONTRAST, "utf8");

    const rows = buildContrastRows({ tokens, pairs });

    expect(generated).toBe(buildContrastMarkdown(rows));
  });
});
