export class InfoStringUtil {
  static readQuoted(info: string | undefined, name: string): string | undefined {
    // Why: a code block's info string carries its options after the language (```md title="AGENTS.md" collapsed), so each option is read here, once, for every block kind.
    const match = new RegExp(`(?:^|\\s)${name}="([^"]*)"`, "u").exec(info ?? "");
    return match?.[1];
  }

  static hasFlag(info: string | undefined, name: string): boolean {
    return new RegExp(`(?:^|\\s)${name}(?=\\s|$)`, "u").test(info ?? "");
  }
}
