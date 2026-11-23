import { describe, it, expect } from "vitest";
import { buildE2eCommands, buildLintCommand, buildRelatedTestsCommand, buildTypecheckCommand } from "./lint-staged.config.mjs";

const CWD = process.cwd();
const UTIL = `${CWD}/src/Utils/TimeUtil.ts`;
const UTIL_TEST = `${CWD}/src/Utils/TimeUtil.test.ts`;

describe("lint-staged config", () => {
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
