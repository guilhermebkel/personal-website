import { describe, expect, it } from "vitest";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

describe("MotionUtil.getStaggerDelay()", () => {
  it("delays each item a little more than the one before", () => {
    expect(MotionUtil.getStaggerDelay(0)).toBe(0);
    expect(MotionUtil.getStaggerDelay(2)).toBe(200);
  });

  it("starts again after a few items, so a long list does not wait", () => {
    expect(MotionUtil.getStaggerDelay(6)).toBe(0);
    expect(MotionUtil.getStaggerDelay(8)).toBe(200);
  });
});
