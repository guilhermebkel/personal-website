import { describe, expect, it } from "vitest";
import { HeadingSlugUtil } from "@/Utils/HeadingSlugUtil.ts";

describe("HeadingSlugUtil.buildId()", () => {
  it("turns a heading into an anchor id without accents or punctuation", () => {
    expect(HeadingSlugUtil.buildId("What did the agent get wrong?")).toBe("what-did-the-agent-get-wrong");
    expect(HeadingSlugUtil.buildId("Por quê?")).toBe("por-que");
  });
});

describe("HeadingSlugUtil.listH2()", () => {
  it("lists only the h2 headings, in order", () => {
    const markdown = "# Title\n\n## One\n\ntext\n\n### Deeper\n\n## Two";

    expect(HeadingSlugUtil.listH2(markdown)).toStrictEqual([
      { id: "one", text: "One" },
      { id: "two", text: "Two" },
    ]);
  });

  it("ignores h2 lines inside code blocks, so a shown file does not add sections", () => {
    const markdown = '## Pieces\n\n```md title="AGENTS.md" collapsed\n## Layout\n## References\n```\n\n## References';

    expect(HeadingSlugUtil.listH2(markdown)).toStrictEqual([
      { id: "pieces", text: "Pieces" },
      { id: "references", text: "References" },
    ]);
  });

  it("ignores a longer fence that holds a shorter one inside", () => {
    const markdown = "````md\n```js\n```\n## Still code\n````\n## After";

    expect(HeadingSlugUtil.listH2(markdown)).toStrictEqual([{ id: "after", text: "After" }]);
  });
});

describe("HeadingSlugUtil.buildNumber()", () => {
  it("numbers the sections from 01 in two digits", () => {
    expect(HeadingSlugUtil.buildNumber(0)).toBe("01");
    expect(HeadingSlugUtil.buildNumber(9)).toBe("10");
  });
});
