import { describe, expect, it } from "vitest";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

describe("MotionUtil.delayFor()", () => {
  it("delays each item a little more than the one before", () => {
    expect(MotionUtil.delayFor(0)).toBe(0);
    expect(MotionUtil.delayFor(2)).toBe(200);
  });

  it("starts again after a few items, so a long list does not wait", () => {
    expect(MotionUtil.delayFor(6)).toBe(0);
    expect(MotionUtil.delayFor(8)).toBe(200);
  });
});
