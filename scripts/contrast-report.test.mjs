import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildContrastRows, findFailingRows } from "./contrast-report.mjs";

const TOKENS_PATH = new URL("../design/system/tokens.json", import.meta.url);
const PAIRS_PATH = new URL("../design/system/contrast-pairs.json", import.meta.url);

const FIXTURE_TOKENS = {
  color: {
    tokens: [
      { name: "white", value: "#ffffff" },
      { name: "grey", value: "#999999" },
      { name: "ghost-free", value: "rgba(255, 255, 255, 0.2)" },
      { name: "ink", value: "#1b1b1e" },
    ],
  },
};

describe("buildContrastRows()", () => {
  describe("a text pair under 4.5:1", () => {
    it("fails and carries its ratio and threshold", () => {
      const rows = buildContrastRows({
        tokens: FIXTURE_TOKENS,
        pairs: [{ foreground: "grey", background: "white", role: "text", uses: "Fixture." }],
      });

      expect(rows[0]).toMatchObject({ ratio: 2.85, threshold: 4.5, passes: false });
    });
  });

  describe("a translucent foreground", () => {
    it("is measured over the named background, not over black", () => {
      const rows = buildContrastRows({
        tokens: FIXTURE_TOKENS,
        pairs: [{ foreground: "ghost-free", background: "ink", role: "ui", uses: "Fixture." }],
      });

      // Why: the expected 1.9 is worked out by hand: 20% white over #1b1b1e is a grey near 72, and over black it would read far higher.
      expect(rows[0]).toMatchObject({ ratio: 1.9, passes: false });
    });
  });

  describe("a pair that names a token tokens.json does not have", () => {
    it("fails with the missing token's name", () => {
      expect(() =>
        buildContrastRows({
          tokens: FIXTURE_TOKENS,
          pairs: [{ foreground: "ghost", background: "white", role: "text", uses: "Fixture." }],
        }),
      ).toThrow('contrast: no color token named "ghost" in tokens.json');
    });
  });

  describe("a decorative pair under any ratio", () => {
    it("is listed and never fails", () => {
      const rows = buildContrastRows({
        tokens: FIXTURE_TOKENS,
        pairs: [{ foreground: "grey", background: "white", role: "decorative", uses: "Fixture." }],
      });

      expect(findFailingRows(rows)).toStrictEqual([]);
    });
  });
});

describe("the color pairs of the site", () => {
  describe("every pair against its role's threshold", () => {
    it("pass", () => {
      const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
      const pairs = JSON.parse(readFileSync(PAIRS_PATH, "utf8"));

      expect(
        findFailingRows(buildContrastRows({ tokens, pairs })).map((row) => `${row.foreground} on ${row.background}`),
      ).toStrictEqual([]);
    });
  });
});
