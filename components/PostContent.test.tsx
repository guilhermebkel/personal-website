import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostContent } from "@components/PostContent.tsx";

const FENCE = "```";
const render = (markdown: string) => renderToStaticMarkup(<PostContent markdown={markdown} />);

describe("PostContent code blocks", () => {
  it("renders a plain block as before, with no label and no control", () => {
    const markup = render(`${FENCE}ts\nconst a = 1;\n${FENCE}\n`);

    expect(markup).toContain("<pre>");
    expect(markup).not.toContain("<details");
  });

  it("shows the title above an open block when the block has a title only", () => {
    const markup = render(`${FENCE}md title="AGENTS.md"\n# Rules\n${FENCE}\n`);

    expect(markup).toContain("AGENTS.md");
    expect(markup).not.toContain("<details");
  });

  it("starts a collapsed block closed, with its title and the full code in the static HTML", () => {
    const markup = render(`${FENCE}md title="AGENTS.md" collapsed\n# Rules\n${FENCE}\n`);

    expect(markup).toContain("<details");
    expect(markup).not.toMatch(/<details[^>]*open/u);
    expect(markup).toContain("<summary");
    expect(markup).toContain("AGENTS.md");
    expect(markup).toContain("# Rules");
  });

  it("labels a collapsed block without a title with its language", () => {
    const markup = render(`${FENCE}yaml collapsed\nkey: value\n${FENCE}\n`);

    expect(markup).toContain("<summary");
    expect(markup).toContain(">yaml<");
  });
});

describe("PostContent diagrams", () => {
  it("shows a diagram picture as a figure, not as code", () => {
    const markup = render("![Harness flow](/diagrams/hello/abc.svg)\n");

    expect(markup).toContain('src="/diagrams/hello/abc.svg"');
    expect(markup).toContain("<figure");
  });
});
