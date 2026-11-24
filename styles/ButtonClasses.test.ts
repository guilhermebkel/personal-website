import { describe, expect, it } from "vitest";
import { BUTTON_VARIANT_TO_CLASS } from "@styles/ButtonClasses.ts";

describe("BUTTON_VARIANT_TO_CLASS", () => {
  describe("primary", () => {
    const classes = BUTTON_VARIANT_TO_CLASS.primary;

    it("fills purple on hover and turns the label graphite when pressed", () => {
      expect(classes).toContain("hover:before:scale-x-100");
      expect(classes).toContain("active:before:bg-pressed");
      expect(classes).toContain("active:text-graphite");
    });

    it("shows the text and border as disabled, with no hover fill", () => {
      expect(classes).toContain("disabled:border-text-disabled");
      expect(classes).toContain("disabled:hover:before:scale-x-0");
    });

    it("keeps a focus ring offset, so the library ring is not clipped", () => {
      expect(classes).toContain("focus-visible:outline-offset-4");
    });
  });

  describe("secondary", () => {
    const classes = BUTTON_VARIANT_TO_CLASS.secondary;

    it("changes only the border on hover, from the touch-free media query", () => {
      expect(classes).toContain("md:hover:border-purple-light");
    });

    it("shows the text and border as disabled", () => {
      expect(classes).toContain("disabled:border-text-disabled");
      expect(classes).toContain("disabled:text-text-disabled");
    });
  });
});
