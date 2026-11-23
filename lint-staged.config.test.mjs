import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import {
  buildE2eCommands,
  buildFormatCommand,
  buildLintCommand,
  buildRelatedTestsCommand,
  buildTypecheckCommand,
} from "./lint-staged.config.mjs";

const CWD = process.cwd();
const UTIL = `${CWD}/src/Utils/TimeUtil.ts`;
const UTIL_TEST = `${CWD}/src/Utils/TimeUtil.test.ts`;

describe("lint-staged config", () => {
  it("formats the staged files with Prettier, skipping the types it does not parse", () => {
    expect(buildFormatCommand([UTIL, UTIL_TEST])).toBe(`prettier --write --ignore-unknown "${UTIL}" "${UTIL_TEST}"`);
  });

  it("fails a file whose class list is out of order and names it", () => {
    // Why: Prettier 3 skips anything in .gitignore, so the fixture sits in a folder that is not ignored, and it lives under the project so the Tailwind stylesheet resolves.
    const fixtureDir = mkdtempSync(join(CWD, "format-fixtures-"));
    try {
      const fixture = join(fixtureDir, "UnsortedClasses.tsx");
      writeFileSync(fixture, `export const Box = () => <div className="p-4 flex" />;\n`);
      const result = spawnSync("pnpm", ["exec", "prettier", "--check", fixture], { encoding: "utf8" });
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain("UnsortedClasses.tsx");
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it("lints the changed files without --fix", () => {
    expect(buildLintCommand([UTIL, UTIL_TEST])).toBe(`node scripts/lint.mjs --max-warnings=0 "${UTIL}" "${UTIL_TEST}"`);
  });

  it("runs the tests that import the changed files", () => {
    expect(buildRelatedTestsCommand([UTIL])).toBe(`vitest related --run --passWithNoTests "${UTIL}"`);
  });

  it("typechecks the project with no file arguments", () => {
    expect(buildTypecheckCommand()).toBe("tsc --noEmit");
  });

  it("starts no browser for a Util and its test", () => {
    expect(buildE2eCommands([UTIL, UTIL_TEST])).toStrictEqual([]);
  });
});
