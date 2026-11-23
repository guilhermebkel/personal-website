export type Heading = {
  id: string;
  text: string;
};

// Why: a post's index and the anchors of its h2 must agree, so both come from this one function.
const HEADING_MARK = "## ";

export class HeadingSlugUtil {
  static toId(text: string): string {
    const plain = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/gu, "");
    const words = plain.split(/[^a-z0-9]/u).filter((word) => word !== "");
    return words.join("-");
  }

  static listH2(markdown: string): Heading[] {
    const lines = markdown.split("\n");
    const marked = lines.filter((line) => line.startsWith(HEADING_MARK));
    const headings = marked.map((line) => line.slice(HEADING_MARK.length).trim());
    return headings.map((text) => ({ id: HeadingSlugUtil.toId(text), text }));
  }
}
