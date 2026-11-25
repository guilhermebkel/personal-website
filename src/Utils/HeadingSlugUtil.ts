import { CodeFenceUtil } from "@/Utils/CodeFenceUtil.ts";

export type Heading = {
  id: string;
  text: string;
};

// Why: a post's index and the anchors of its h2 must agree, so both come from this one function.
const HEADING_MARK = "## ";
const NUMBER_WIDTH = 2;

export class HeadingSlugUtil {
  static buildId(text: string): string {
    const plain = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/gu, "");
    const words = plain.split(/[^a-z0-9]/u).filter((word) => word !== "");
    return words.join("-");
  }

  static buildNumber(index: number): string {
    // Why: the sections are numbered from 01 so a reader can name one by its number, as the mono index shows them.
    return String(index + 1).padStart(NUMBER_WIDTH, "0");
  }

  static listH2(markdown: string): Heading[] {
    // Why: a "## " line inside a code block is the shown file's heading, not a section of the post.
    const lines = CodeFenceUtil.listProseLines(markdown);
    const marked = lines.filter((line) => line.startsWith(HEADING_MARK));
    const headings = marked.map((line) => line.slice(HEADING_MARK.length).trim());
    return headings.map((text) => ({ id: HeadingSlugUtil.buildId(text), text }));
  }
}
