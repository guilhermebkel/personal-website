import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostContent } from "@components/PostContent.tsx";

const FENCE = "```";
const render = (markdown: string) => renderToStaticMarkup(<PostContent markdown={markdown} />);

const BLOCK_COUNT = 2;

describe("PostContent code blocks", () => {
  it("shows the language of a plain block in a header, with no control", () => {
    const markup = render(`${FENCE}ts\nconst a = 1;\n${FENCE}\n`);

    expect(markup).toContain(">ts<");
    expect(markup).toContain("<pre");
    expect(markup).not.toContain("<details");
  });

  it("lets the keyboard focus every code block, since it scrolls sideways", () => {
    const markup = render(`${FENCE}ts\nconst a = 1;\n${FENCE}\n\n${FENCE}\nplain\n${FENCE}\n`);

    expect(markup.match(/<pre tabindex="0"/gu)).toHaveLength(BLOCK_COUNT);
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

describe("PostContent notes", () => {
  it("keeps the id of each note reference, so the note's back link has a target", () => {
    const markup = render("A claim[^1].\n\n[^1]: The note.\n");
    const backTargets = [...markup.matchAll(/href="#(user-content-fnref-[^"]+)"/gu)].map((match) => match[1]);

    expect(backTargets).toHaveLength(1);
    for (const target of backTargets) {
      expect(markup).toContain(`id="${target}"`);
    }
  });

  it("keeps the label of the back link for screen readers", () => {
    const markup = render("A claim[^1].\n\n[^1]: The note.\n");

    expect(markup).toMatch(
      /href="#user-content-fnref-1"[^>]*aria-label="Back to reference 1"|aria-label="Back to reference 1"[^>]*href="#user-content-fnref-1"/u,
    );
  });
});
