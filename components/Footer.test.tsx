import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "@components/Footer.tsx";

describe("Footer", () => {
  it("is 96 px tall on the graphite-deep band with a sunken top border", () => {
    const markup = renderToStaticMarkup(<Footer />);

    expect(markup).toContain("h-24");
    expect(markup).toContain("bg-graphite-deep");
    expect(markup).toContain("border-t");
    expect(markup).toContain("border-sunken");
  });
});
