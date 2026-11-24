import { readFile } from "node:fs/promises";
import { join } from "node:path";

const FONT_DIRECTORY = join(process.cwd(), "node_modules", "@fontsource", "ubuntu", "files");
const WIDTH = 1200;
const HEIGHT = 630;
type FontWeight = 400 | 700;

const REGULAR_WEIGHT: FontWeight = 400;
const BOLD_WEIGHT: FontWeight = 700;

const readFont = async (weight: FontWeight) => {
  // Why: the share image is drawn by next/og, which needs the font bytes; WOFF is the format it reads from @fontsource.
  const bytes = await readFile(join(FONT_DIRECTORY, `ubuntu-latin-${weight}-normal.woff`));
  return { name: "Ubuntu", data: new Uint8Array(bytes).buffer, weight: weight, style: "normal" as const };
};

export class OgImageUtil {
  static readonly SIZE = { width: WIDTH, height: HEIGHT };

  static async readFonts() {
    const [regular, bold] = await Promise.all([readFont(REGULAR_WEIGHT), readFont(BOLD_WEIGHT)]);
    return [regular, bold];
  }
}
