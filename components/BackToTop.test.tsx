import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BackToTop } from "@components/BackToTop.tsx";

describe("BackToTop", () => {
  it("is a link to the top of the page with its label and an up arrow", () => {
    const markup = renderToStaticMarkup(<BackToTop />);

    expect(markup).toContain('href="#main"');
    expect(markup).toContain("Back to top");
  });
});
