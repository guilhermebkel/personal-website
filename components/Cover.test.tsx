import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Cover } from "@components/Cover.tsx";

describe("Cover", () => {
  it("zooms to 1.03 on card hover and not under reduced motion", () => {
    const markup = renderToStaticMarkup(<Cover className="h-50" seed="/blog/hello-world/" />);

    expect(markup).toContain("group-hover/card:scale-[1.03]");
    expect(markup).toContain("motion-reduce:transform-none");
  });

  it("draws the same lines for the same seed and other lines for another seed", () => {
    const first = renderToStaticMarkup(<Cover className="h-50" seed="/blog/hello-world/" />);
    const again = renderToStaticMarkup(<Cover className="h-50" seed="/blog/hello-world/" />);
    const other = renderToStaticMarkup(<Cover className="h-50" seed="/blog/another-post/" />);

    expect(again).toBe(first);
    expect(other).not.toBe(first);
  });
});
