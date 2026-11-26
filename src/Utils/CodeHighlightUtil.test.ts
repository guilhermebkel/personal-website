import { describe, expect, it } from "vitest";
import { CodeHighlightUtil } from "@/Utils/CodeHighlightUtil.ts";

type Node = {
  type: "element" | "text";
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const buildCodeBlock = (language: string, text: string): Node => ({
  type: "element",
  tagName: "pre",
  children: [
    {
      type: "element",
      tagName: "code",
      properties: { className: [`language-${language}`] },
      children: [{ type: "text", value: text }],
    },
  ],
});

const applyBlock = (node: Node): Node => {
  CodeHighlightUtil.buildRehypePlugin()(node);
  return node;
};

const collectClasses = (node: Node): string[] => {
  const classNames = node.properties?.className;
  const own = Array.isArray(classNames) ? (classNames as string[]) : [];
  const nested = node.children?.flatMap(collectClasses) ?? [];
  return [...own, ...nested];
};

describe("CodeHighlightUtil.buildRehypePlugin()", () => {
  it("colors keywords and strings with classes, never with an inline style", () => {
    const tree = applyBlock(buildCodeBlock("typescript", 'const name = "guilherr";'));

    expect(collectClasses(tree)).toStrictEqual(expect.arrayContaining(["tok-keyword", "tok-string"]));
    expect(JSON.stringify(tree)).not.toContain('"style"');
  });

  it("leaves a block in a language it does not know as plain text", () => {
    const block = buildCodeBlock("cobol", "DISPLAY 'HELLO'.");
    const before = JSON.stringify(block);

    const result = applyBlock(block);
    expect(JSON.stringify(result)).toBe(before);
  });
});
