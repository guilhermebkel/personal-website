import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostContent } from "@components/PostContent.tsx";

describe("PostContent", () => {
  it("renders an image with a title as a figure with its caption", () => {
    const markup = renderToStaticMarkup(<PostContent markdown={'![IAM](/x.png "Open IAM and go to Roles")'} />);

    expect(markup).toContain("<figure");
    expect(markup).toContain("<figcaption>Open IAM and go to Roles</figcaption>");
  });

  it("renders an image without a title as a figure with no caption", () => {
    const markup = renderToStaticMarkup(<PostContent markdown={"![IAM](/x.png)"} />);

    expect(markup).toContain("<figure");
    expect(markup).not.toContain("<figcaption");
  });

  it("keeps an image inside a sentence inline, never a figure inside a paragraph", () => {
    const markup = renderToStaticMarkup(<PostContent markdown={'Click ![icon](/i.png "Title") here.'} />);

    expect(markup).not.toContain("<figure");
    expect(markup).not.toMatch(/<p[^>]*>[^]*<figure/u);
  });

  it("opens an external link in a new tab and keeps a note link in this tab", () => {
    const markup = renderToStaticMarkup(
      <PostContent markdown={"See [docs](https://example.com) and the note[^1].\n\n[^1]: The note."} />,
    );

    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('href="#user-content-fn-1"');
    expect(markup).not.toMatch(/href="#user-content-fn-1"[^>]*target="_blank"/u);
  });

  it("labels the footnote block Notes and keeps its id for the references", () => {
    const markup = renderToStaticMarkup(<PostContent markdown={"Text[^1].\n\n[^1]: A note."} />);

    expect(markup).toContain('id="footnote-label"');
    expect(markup).toContain(">Notes<");
    expect(markup).not.toContain("Footnotes");
  });

  it("renders no Notes block when the post has no footnotes", () => {
    const markup = renderToStaticMarkup(<PostContent markdown={"Plain text."} />);

    expect(markup).not.toContain("Notes");
    expect(markup).not.toContain('data-footnotes=""');
  });
});
