import { describe, expect, it } from "vitest";
import { CodeFenceUtil } from "@/Utils/CodeFenceUtil.ts";

describe("CodeFenceUtil.splitBlocks()", () => {
  it("separates prose from fenced blocks and keeps each block's info string", () => {
    const markdown = 'intro\n\n```md title="A.md" collapsed\n## Inside\n```\n\noutro';

    expect(CodeFenceUtil.splitBlocks(markdown)).toStrictEqual([
      { isFenced: false, info: "", lines: ["intro", ""] },
      { isFenced: true, info: 'md title="A.md" collapsed', lines: ["## Inside"] },
      { isFenced: false, info: "", lines: ["", "outro"] },
    ]);
  });

  it("closes a fence only with a fence at least as long, of the same character", () => {
    const markdown = "````md\n```js\ncode\n```\n````\nafter";

    expect(CodeFenceUtil.splitBlocks(markdown)).toStrictEqual([
      { isFenced: true, info: "md", lines: ["```js", "code", "```"] },
      { isFenced: false, info: "", lines: ["after"] },
    ]);
  });

  it("treats tildes as a fence and an unclosed fence as running to the end", () => {
    const markdown = "~~~\n## Not a heading\n~~~\n```\nopen";

    expect(CodeFenceUtil.splitBlocks(markdown)).toStrictEqual([
      { isFenced: true, info: "", lines: ["## Not a heading"] },
      { isFenced: true, info: "", lines: ["open"] },
    ]);
  });
});

describe("CodeFenceUtil.listProseLines()", () => {
  it("returns only the lines outside code blocks", () => {
    expect(CodeFenceUtil.listProseLines("a\n```\nb\n```\nc")).toStrictEqual(["a", "c"]);
  });
});
