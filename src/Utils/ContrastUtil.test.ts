import { describe, expect, it } from "vitest";
import { ContrastUtil } from "./ContrastUtil.ts";

const WHITE = { red: 255, green: 255, blue: 255 };
const BLACK = { red: 0, green: 0, blue: 0 };
const GRAPHITE = { red: 27, green: 27, blue: 30 };

describe("ContrastUtil.resolveContrastRatio()", () => {
  describe("white on black", () => {
    it("is the WCAG maximum of 21", () => {
      expect(ContrastUtil.resolveContrastRatio(WHITE, BLACK)).toBeCloseTo(21, 5);
    });
  });

  describe("two equal colors", () => {
    it("is 1", () => {
      expect(ContrastUtil.resolveContrastRatio(GRAPHITE, GRAPHITE)).toBeCloseTo(1, 5);
    });
  });

  describe("#767676 on white", () => {
    it("is 4.54, the grey that just passes the 4.5:1 of text", () => {
      expect(ContrastUtil.resolveContrastRatio(ContrastUtil.parseColor("#767676").rgb, WHITE)).toBeCloseTo(4.54, 2);
    });
  });
});

describe("ContrastUtil.resolveComposite()", () => {
  describe("white at 20% alpha over graphite", () => {
    it("is the opaque mix of the two colors, not white over black", () => {
      const composite = ContrastUtil.resolveComposite(ContrastUtil.parseColor("rgba(255,255,255,.2)"), GRAPHITE);

      expect(composite).toStrictEqual({ red: 72.6, green: 72.6, blue: 75 });
    });
  });
});

describe("ContrastUtil.parseColor()", () => {
  describe("a color that is neither hex nor rgb", () => {
    it("is refused with the value", () => {
      expect(() => ContrastUtil.parseColor("purple")).toThrow('ContrastUtil: unsupported color "purple"');
    });
  });
});
