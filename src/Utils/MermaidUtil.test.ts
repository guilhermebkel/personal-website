import { describe, expect, it } from "vitest";
import { MermaidUtil } from "@/Utils/MermaidUtil.ts";

const FLOW = "flowchart LR\n  A --> B\n";
const POST = `Intro.\n\n\`\`\`mermaid\n${FLOW}\`\`\`\n\nOutro.\n`;

describe("MermaidUtil.listDiagrams()", () => {
  it("lists each mermaid block with its source and default alt", () => {
    expect(MermaidUtil.listDiagrams(POST)).toStrictEqual([{ alt: "Diagram", source: FLOW }]);
  });

  it("reads the alt option of the info string", () => {
    const markdown = `\`\`\`mermaid alt="Release flow"\n${FLOW}\`\`\`\n`;

    expect(MermaidUtil.listDiagrams(markdown)[0]?.alt).toBe("Release flow");
  });

  it("ignores other code blocks", () => {
    expect(MermaidUtil.listDiagrams("```ts\nconst a = 1;\n```\n")).toStrictEqual([]);
  });
});

describe("MermaidUtil.buildPublicPath()", () => {
  it("names the picture after the post and the hash of its source", () => {
    const path = MermaidUtil.buildPublicPath("hello", FLOW);

    expect(path).toMatch(/^\/diagrams\/hello\/[0-9a-f]{16}\.svg$/u);
    expect(MermaidUtil.buildPublicPath("hello", FLOW)).toBe(path);
    expect(MermaidUtil.buildPublicPath("hello", `${FLOW}  C --> D\n`)).not.toBe(path);
  });
});

describe("MermaidUtil.replaceDiagrams()", () => {
  it("replaces a block with an image alone in its paragraph, and keeps the text around it", () => {
    const replaced = MermaidUtil.replaceDiagrams("hello", POST);

    expect(replaced).not.toContain("```mermaid");
    expect(replaced).toContain(`![Diagram](${MermaidUtil.buildPublicPath("hello", FLOW)})`);
    expect(replaced).toContain("Intro.");
    expect(replaced).toContain("Outro.");
  });

  it("removes brackets and quotes from the alt text", () => {
    const markdown = `\`\`\`mermaid alt="a [b] c"\n${FLOW}\`\`\`\n`;

    expect(MermaidUtil.replaceDiagrams("hello", markdown)).toContain("![a b c](");
  });
});
