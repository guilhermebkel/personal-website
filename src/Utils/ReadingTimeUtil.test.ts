import { describe, expect, it } from "vitest";
import { ReadingTimeUtil } from "@/Utils/ReadingTimeUtil.ts";

describe("ReadingTimeUtil.countMinutes()", () => {
  it("counts at least one minute for a short text", () => {
    expect(ReadingTimeUtil.countMinutes("two words")).toBe(1);
  });

  it("rounds up to the next minute", () => {
    const text = Array.from({ length: ReadingTimeUtil.WORDS_PER_MINUTE + 1 }, () => "word").join(" ");

    expect(ReadingTimeUtil.countMinutes(text)).toBe(2);
  });
});
