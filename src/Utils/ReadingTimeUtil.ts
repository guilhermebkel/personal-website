export class ReadingTimeUtil {
  static readonly WORDS_PER_MINUTE = 200;

  static countMinutes(text: string): number {
    const words = text.split(/\s+/u).filter((word) => word !== "").length;
    return Math.max(1, Math.ceil(words / ReadingTimeUtil.WORDS_PER_MINUTE));
  }
}
