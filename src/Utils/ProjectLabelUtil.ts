const INDEX_OFFSET = 1;
const NUMBER_WIDTH = 2;

export class ProjectLabelUtil {
  static formatIndex(index: number): string {
    return `P/${String(index + INDEX_OFFSET).padStart(NUMBER_WIDTH, "0")}`;
  }

  static getHost(url: string): string {
    return new URL(url).host;
  }
}
