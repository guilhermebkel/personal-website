export type MarkdownBlock = {
  isFenced: boolean;
  info: string;
  lines: string[];
};

type Fence = { marker: string; rest: string };

const FENCE_CHARACTERS = new Set(["`", "~"]);
const MIN_FENCE_LENGTH = 3;
const MAX_INDENT = 3;

const readFence = (line: string): Fence | undefined => {
  // Why: CommonMark opens or closes a fence with three or more backticks or tildes, indented at most three spaces.
  const trimmed = line.trimStart();
  const fenceCharacter = trimmed.charAt(0);
  if (line.length - trimmed.length > MAX_INDENT || !FENCE_CHARACTERS.has(fenceCharacter)) {
    return undefined;
  }
  let length = 0;
  while (trimmed.charAt(length) === fenceCharacter) {
    length += 1;
  }
  if (length < MIN_FENCE_LENGTH) {
    return undefined;
  }
  return { marker: trimmed.slice(0, length), rest: trimmed.slice(length) };
};

const isClosing = (line: string, marker: string): boolean => {
  // Why: a fence closes only with the same character, at least as long as the opening one, and nothing after it.
  const fence = readFence(line);
  if (fence === undefined) {
    return false;
  }
  return fence.marker.startsWith(marker.charAt(0)) && fence.marker.length >= marker.length && fence.rest.trim() === "";
};

const buildProse = (): MarkdownBlock => {
  return { isFenced: false, info: "", lines: [] };
};

export class CodeFenceUtil {
  static splitBlocks(markdown: string): MarkdownBlock[] {
    const blocks: MarkdownBlock[] = [];
    let current = buildProse();
    let marker = "";
    for (const line of markdown.split("\n")) {
      const opening = current.isFenced ? undefined : readFence(line);
      if (current.isFenced && isClosing(line, marker)) {
        blocks.push(current);
        current = buildProse();
      } else if (opening === undefined) {
        current.lines.push(line);
      } else {
        blocks.push(current);
        marker = opening.marker;
        current = { isFenced: true, info: opening.rest, lines: [] };
      }
    }
    blocks.push(current);
    return blocks.filter((block) => block.isFenced || block.lines.length > 0);
  }

  static listProseLines(markdown: string): string[] {
    return CodeFenceUtil.splitBlocks(markdown)
      .filter((block) => !block.isFenced)
      .flatMap((block) => block.lines);
  }
}
