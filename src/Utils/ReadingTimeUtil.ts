import { CodeFenceUtil } from "@/Utils/CodeFenceUtil.ts";
import { InfoStringUtil } from "@/Utils/InfoStringUtil.ts";

const COLLAPSED_FLAG = "collapsed";
const DIAGRAM_LANGUAGE = "mermaid";

const readLanguage = (info: string): string => {
  return info.trim().split(/\s+/u)[0] ?? "";
};

const isReadBlock = (info: string): boolean => {
  // Why: a collapsed block is opened only by who wants it and a diagram is looked at, not read, so neither counts as reading time.
  return readLanguage(info) !== DIAGRAM_LANGUAGE && !InfoStringUtil.hasFlag(info, COLLAPSED_FLAG);
};

export class ReadingTimeUtil {
  static readonly WORDS_PER_MINUTE = 200;

  static countMinutes(text: string): number {
    const words = text.split(/\s+/u).filter((word) => word !== "").length;
    return Math.max(1, Math.ceil(words / ReadingTimeUtil.WORDS_PER_MINUTE));
  }

  static countPostMinutes(markdown: string): number {
    const readBlocks = CodeFenceUtil.splitBlocks(markdown).filter(
      (block) => !block.isFenced || isReadBlock(block.info),
    );
    return ReadingTimeUtil.countMinutes(readBlocks.flatMap((block) => block.lines).join("\n"));
  }
}
