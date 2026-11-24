import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostSectionBar } from "@components/PostSectionBar.tsx";

const HEADINGS = [
  { id: "one", text: "One" },
  { id: "two", text: "Two" },
];

describe("PostSectionBar", () => {
  it("renders nothing for a post with no section", () => {
    expect(renderToStaticMarkup(<PostSectionBar headings={[]} />)).toBe("");
  });

  it("shows the first section number and title, with the list closed", () => {
    const markup = renderToStaticMarkup(<PostSectionBar headings={HEADINGS} />);

    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain(">01<");
    expect(markup).toContain(">One<");
    expect(markup).toContain("hidden");
  });

  it("numbers every section of the list from 01", () => {
    const markup = renderToStaticMarkup(<PostSectionBar headings={HEADINGS} />);

    expect(markup).toContain(">02<");
    expect(markup).toContain('href="#two"');
  });
});
