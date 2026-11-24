import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostCard } from "@components/PostCard.tsx";
import { PostRow } from "@components/PostRow.tsx";

const POST = {
  href: "/blog/hello-world/",
  date: "2026-11-18",
  readingMinutes: 6,
  title: "Title",
  summary: "Summary",
  tags: ["meta"],
};

describe("PostCard", () => {
  it("is a 200 px cover with radius 16 and a 16 px inset, as the blog board draws it", () => {
    const markup = renderToStaticMarkup(<PostCard {...POST} />);

    expect(markup).toContain("h-50");
    expect(markup).toContain("rounded-md");
    expect(markup).toContain("-m-4");
    expect(markup).toContain("p-4");
    expect(markup).toContain("rounded-lg");
  });

  it("sets the date line in text-meta, the title at 24/30 and the summary in text-summary", () => {
    const markup = renderToStaticMarkup(<PostCard {...POST} />);

    expect(markup).toContain("text-text-meta");
    expect(markup).toContain("text-title");
    expect(markup).toContain("text-text-summary");
  });
});

describe("PostRow", () => {
  it("is a 224 px wide, 126 px tall cover, with a 48 px go control and a 24 px side margin", () => {
    const markup = renderToStaticMarkup(<PostRow {...POST} />);

    expect(markup).toContain("h-31.5");
    expect(markup).toContain("w-56");
    expect(markup).toContain("size-12");
    expect(markup).toContain("-mx-6");
    expect(markup).toContain("px-6");
  });
});
