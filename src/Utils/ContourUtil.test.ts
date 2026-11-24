import { describe, expect, it } from "vitest";
import { ContourUtil } from "@/Utils/ContourUtil.ts";

describe("ContourUtil.computeWave()", () => {
  it("ends a line at the height where it starts, so the pattern tiles sideways", () => {
    const spacing = 60;

    const end = ContourUtil.computeWave(1, 3, spacing);
    const start = ContourUtil.computeWave(0, 3, spacing);

    expect(end).toBeCloseTo(start, 6);
  });
});

describe("ContourUtil.buildPaths()", () => {
  it("draws every line three times, one tile above, in and below", () => {
    const paths = ContourUtil.buildPaths({ width: 1440, height: 600, lineCount: 5 });

    expect(paths).toHaveLength(15);
  });
});

describe("ContourUtil.buildCoverLines()", () => {
  it("draws every line once", () => {
    const lines = ContourUtil.buildCoverLines({ width: 400, height: 190, lineCount: 9 }, 0);

    expect(lines).toHaveLength(9);
  });

  it("draws different lines for different phases and the same lines for the same phase", () => {
    const tile = { width: 400, height: 190, lineCount: 9 };

    expect(ContourUtil.buildCoverLines(tile, 1)).toStrictEqual(ContourUtil.buildCoverLines(tile, 1));
    expect(ContourUtil.buildCoverLines(tile, 1)).not.toStrictEqual(ContourUtil.buildCoverLines(tile, 2));
  });
});
