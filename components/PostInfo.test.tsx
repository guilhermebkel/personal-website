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

  it("shows the updated date after the published one when the post has one", () => {
    const markup = renderToStaticMarkup(
      <PostInfo date="2021-03-21" updated="2026-11-24" readingMinutes={10} title="Title" headingLevel="h1" isLarge />,
    );

    expect(markup).toContain("21 Mar 2021 · Updated 24 Nov 2026 · 10 min read");
  });

  it("shows only the published date when the post has no update", () => {
    const markup = renderToStaticMarkup(<PostInfo date="2021-03-21" readingMinutes={10} title="Title" />);

    expect(markup).not.toContain("Updated");
  });
});
