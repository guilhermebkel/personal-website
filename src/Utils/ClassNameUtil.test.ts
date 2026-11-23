import { describe, expect, it } from "vitest";
import { ClassNameUtil } from "@/Utils/ClassNameUtil.ts";

describe("ClassNameUtil.merge()", () => {
  it("keeps the last of two classes that set the same property", () => {
    const merged = ClassNameUtil.merge("px-4 h-10", "px-2");

    expect(merged).toBe("h-10 px-2");
  });

  it("drops falsy values", () => {
    const merged = ClassNameUtil.merge("flex", false, undefined, "gap-2");

    expect(merged).toBe("flex gap-2");
  });
});
