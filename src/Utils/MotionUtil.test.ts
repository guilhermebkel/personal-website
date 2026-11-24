import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

const TOKENS = new URL("../../design/system/tokens.json", import.meta.url);
const STAGGER = (JSON.parse(readFileSync(TOKENS, "utf8")) as { motion: { stagger: { step: string; wrap: number } } })
  .motion.stagger;
const STEP_MS = Number.parseInt(STAGGER.step, 10);

describe("MotionUtil.getStaggerDelay()", () => {
  it("delays each item a little more than the one before", () => {
    expect(MotionUtil.getStaggerDelay(0)).toBe(0);
    expect(MotionUtil.getStaggerDelay(2)).toBe(200);
  });

  it("starts again after a few items, so a long list does not wait", () => {
    expect(MotionUtil.getStaggerDelay(6)).toBe(0);
    expect(MotionUtil.getStaggerDelay(8)).toBe(200);
  });

  it("uses the step and the wrap that design/system/tokens.json names", () => {
    expect(MotionUtil.getStaggerDelay(1)).toBe(STEP_MS);
    expect(MotionUtil.getStaggerDelay(STAGGER.wrap - 1)).toBe((STAGGER.wrap - 1) * STEP_MS);
    expect(MotionUtil.getStaggerDelay(STAGGER.wrap)).toBe(0);
  });
});
