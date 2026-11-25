import { createHash } from "node:crypto";
import { InfoStringUtil } from "./InfoStringUtil.ts";

const LANGUAGE = "mermaid";
const FENCE = new RegExp("^```" + LANGUAGE + "([^\\n]*)\\n([\\s\\S]*?)^```[ \\t]*$", "gmu");
const ALT_ATTRIBUTE = "alt";
const DEFAULT_ALT = "Diagram";
const HASH_LENGTH = 16;
const DIAGRAM_DIRECTORY = "/diagrams";
const SVG_EXTENSION = ".svg";

export type Diagram = { source: string; alt: string };

const readAlt = (info: string): string => {
  // Why: a diagram without an alt option still needs a name for screen readers, so it gets the default.
  return InfoStringUtil.readQuoted(info, ALT_ATTRIBUTE) ?? DEFAULT_ALT;
};

const escapeAlt = (alt: string): string => {
  // Why: the alt text is written into Markdown, so brackets and quotes would end the image early.
  return alt.replace(/[[\]"]/gu, "");
};

export class MermaidUtil {
  static listDiagrams(markdown: string): Diagram[] {
    return [...markdown.matchAll(FENCE)].map((match) => ({ alt: readAlt(match[1] ?? ""), source: match[2] ?? "" }));
  }

  static buildPublicPath(slug: string, source: string): string {
    // Why: the file name is the hash of the source, so a changed diagram gets a new address and the browser never shows an old picture.
    const hash = createHash("sha256").update(source).digest("hex").slice(0, HASH_LENGTH);
    return `${DIAGRAM_DIRECTORY}/${slug}/${hash}${SVG_EXTENSION}`;
  }

  static replaceDiagrams(slug: string, markdown: string): string {
    // Why: a diagram becomes an image alone in its paragraph, so PostContent shows it as a figure like any other picture.
    return markdown.replace(FENCE, (_block: string, info: string, source: string) => {
      const alt = escapeAlt(readAlt(info));
      return `\n![${alt}](${MermaidUtil.buildPublicPath(slug, source)})\n`;
    });
  }
}
