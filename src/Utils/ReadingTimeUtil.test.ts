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

describe("ReadingTimeUtil.countPostMinutes()", () => {
  const buildWords = (count: number): string => Array.from({ length: count }, () => "word").join(" ");

  it("does not count collapsed code blocks or diagrams", () => {
    const markdown = [
      buildWords(ReadingTimeUtil.WORDS_PER_MINUTE),
      '```md title="AGENTS.md" collapsed',
      buildWords(ReadingTimeUtil.WORDS_PER_MINUTE),
      "```",
      "```mermaid",
      buildWords(ReadingTimeUtil.WORDS_PER_MINUTE),
      "```",
    ].join("\n");

    expect(ReadingTimeUtil.countPostMinutes(markdown)).toBe(1);
  });

  it("counts an open code block like the prose around it", () => {
    const markdown = [buildWords(ReadingTimeUtil.WORDS_PER_MINUTE), "```md", buildWords(1), "```"].join("\n");

    expect(ReadingTimeUtil.countPostMinutes(markdown)).toBe(2);
  });
});
