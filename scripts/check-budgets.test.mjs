import { describe, it, expect } from "vitest";
import { findFontFaceProblems, findOverBudget } from "./check-budgets.mjs";

describe("findOverBudget()", () => {
  describe("scripts that add up to exactly the budget", () => {
    it("is within budget", () => {
      expect(findOverBudget({ sizesByPath: { "a.js": 100, "b.js": 50 }, budget: 150 })).toBeUndefined();
    });
  });

  describe("scripts that add up to one byte over the budget", () => {
    it("names the total and the budget", () => {
      expect(findOverBudget({ sizesByPath: { "a.js": 100, "b.js": 51 }, budget: 150 })).toStrictEqual({
        total: 151,
        budget: 150,
      });
    });
  });
});

describe("findFontFaceProblems()", () => {
  describe("a font face that loads woff2 first and is a unicode-range subset", () => {
    it("reports nothing", () => {
      const css =
        '@font-face{font-family:"Caveat";src:url(../media/caveat-latin.abc.woff2) format("woff2"),url(../media/caveat-latin.abc.woff) format("woff");unicode-range:U+0000-00FF;}';

      expect(findFontFaceProblems(css)).toStrictEqual([]);
    });
  });

  describe("a font face whose first format is woff", () => {
    it("names the file", () => {
      const css =
        '@font-face{font-family:"Caveat";src:url(../media/caveat-latin.abc.woff) format("woff");unicode-range:U+0000-00FF;}';

      expect(findFontFaceProblems(css)).toStrictEqual(["first format is not woff2: ../media/caveat-latin.abc.woff"]);
    });
  });

  describe("a font face with no unicode-range", () => {
    it("reports that it is not a subset", () => {
      const css = '@font-face{font-family:"Ubuntu";src:url(../media/ubuntu.abc.woff2) format("woff2");}';

      expect(findFontFaceProblems(css)).toStrictEqual(["no unicode-range (not a subset): ../media/ubuntu.abc.woff2"]);
    });
  });
});
