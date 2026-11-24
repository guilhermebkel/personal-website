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
});

describe("HeadingSlugUtil.buildNumber()", () => {
  it("numbers the sections from 01 in two digits", () => {
    expect(HeadingSlugUtil.buildNumber(0)).toBe("01");
    expect(HeadingSlugUtil.buildNumber(9)).toBe("10");
  });
});
