import { readFileSync } from "node:fs";
import { join } from "node:path";

const TOKENS_PATH = "design/system/tokens.json";

type ColorToken = { name: string; value: string };
type TokensFile = { color: { tokens: ColorToken[] } };

export class ColorTokenUtil {
  static readColor(name: string): string {
    // Why: the share images are drawn at build time, so they read the same tokens.json the site's CSS is generated from.
    const tokensPath = join(process.cwd(), TOKENS_PATH);
    const tokensText = readFileSync(tokensPath, "utf8");
    const tokens = JSON.parse(tokensText) as TokensFile;
    const token = tokens.color.tokens.find((candidate) => candidate.name === name);
    if (token === undefined) {
      throw new Error(`color token "${name}" is not in ${TOKENS_PATH}`);
    }
    return token.value;
  }
}
