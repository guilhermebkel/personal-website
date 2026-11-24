import { describe, expect, it } from "vitest";
import { ColorTokenUtil } from "@/Utils/ColorTokenUtil.ts";

describe("ColorTokenUtil.readColor()", () => {
  it("reads a color value from design/system/tokens.json", () => {
    expect(ColorTokenUtil.readColor("graphite")).toBe("#1b1b1e");
  });

  it("fails for a name that tokens.json does not have", () => {
    expect(() => ColorTokenUtil.readColor("no-such-token")).toThrow('color token "no-such-token" is not in');
  });
});
