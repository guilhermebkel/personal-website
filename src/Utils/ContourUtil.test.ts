import { describe, expect, it } from "vitest";
import { ContourUtil } from "@/Utils/ContourUtil.ts";

describe("ContourUtil.waveAt()", () => {
  it("ends a line at the height where it starts, so the pattern tiles sideways", () => {
    const spacing = 60;

    const end = ContourUtil.waveAt(1, 3, spacing);
    const start = ContourUtil.waveAt(0, 3, spacing);

    expect(end).toBeCloseTo(start, 6);
  });
});

describe("ContourUtil.buildPaths()", () => {
  it("draws every line three times, one tile above, in and below", () => {
    const paths = ContourUtil.buildPaths({ width: 1440, height: 600, lineCount: 5 });

    expect(paths).toHaveLength(15);
  });
});
