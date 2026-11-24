import { describe, expect, it } from "vitest";
import { CoverUtil } from "@/Utils/CoverUtil.ts";

const POST_PATH = "/blog/hello-world/";
const OTHER_POST_PATH = "/blog/another-post/";
const LONG_SEED = "a very long seed that goes on for a while to wrap the hash";
const FULL_TURN = Math.PI + Math.PI;

describe("CoverUtil.getPhase()", () => {
  it("gives the same phase for the same seed", () => {
    expect(CoverUtil.getPhase(POST_PATH)).toBe(CoverUtil.getPhase(POST_PATH));
  });

  it("gives different phases for different seeds", () => {
    expect(CoverUtil.getPhase(POST_PATH)).not.toBe(CoverUtil.getPhase(OTHER_POST_PATH));
  });

  it("stays within one turn", () => {
    const phase = CoverUtil.getPhase(LONG_SEED);

    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThan(FULL_TURN);
  });
});
