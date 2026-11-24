import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostInfo } from "@components/PostInfo.tsx";

const LONG_TITLE = "A title that goes on for ninety characters so that it has to wrap onto a second line in the card";
const SIX_TAGS = ["a", "b", "c", "d", "e", "f"];

describe("PostInfo", () => {
  it("writes the date as 18 Nov 2026 and the reading time", () => {
    const markup = renderToStaticMarkup(
      <PostInfo date="2026-11-18" readingMinutes={6} title="Title" headingLevel="h2" />,
    );

    expect(markup).toContain("18 Nov 2026 · 6 min read");
  });

  it("renders no tag row when the post has no tags", () => {
    const markup = renderToStaticMarkup(<PostInfo date="2026-11-18" readingMinutes={1} title="Title" tags={[]} />);

    expect(markup).not.toContain("<ul");
  });

  it("renders one item per tag", () => {
    const markup = renderToStaticMarkup(
      <PostInfo date="2026-11-18" readingMinutes={1} title="Title" tags={SIX_TAGS} />,
    );

    expect(markup.match(/<li>/gu)).toHaveLength(SIX_TAGS.length);
  });

  it("lets a long title wrap instead of cutting it with an ellipsis", () => {
    const markup = renderToStaticMarkup(
      <PostInfo date="2026-11-18" readingMinutes={1} title={LONG_TITLE} headingLevel="h2" />,
    );

    expect(markup).toContain(LONG_TITLE);
    expect(markup).not.toContain("truncate");
    expect(markup).not.toContain("line-clamp");
  });
});
