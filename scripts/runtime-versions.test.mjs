import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { checkRuntimeVersions } from "./runtime-versions.mjs";

const AGREEING = { nvmrc: "22\n", enginesNode: ">=22", packageManager: "pnpm@10.28.0" };

describe("checkRuntimeVersions()", () => {
  it("passes when .nvmrc, engines.node and packageManager agree", () => {
    expect(checkRuntimeVersions(AGREEING)).toStrictEqual([]);
  });

  it("fails when .nvmrc and engines.node name different Node majors", () => {
    const problems = checkRuntimeVersions({ ...AGREEING, nvmrc: "24\n" });
    expect(problems).toStrictEqual([".nvmrc says Node 24 but engines.node starts at 22."]);
  });

  it("accepts an .nvmrc written with a leading v or a minor version", () => {
    expect(checkRuntimeVersions({ ...AGREEING, nvmrc: "v22.11.0\n" })).toStrictEqual([]);
  });

  it("fails when packageManager is not an exact pnpm version", () => {
    const problems = checkRuntimeVersions({ ...AGREEING, packageManager: "pnpm@^10" });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("exact pnpm version");
  });

  it("fails when engines.node is not a lower-bound range", () => {
    const problems = checkRuntimeVersions({ ...AGREEING, enginesNode: "22" });
    expect(problems[0]).toContain("engines.node must be");
  });
});

// Why: the repository's own files must agree now; this test is what fails when a bump lands in one place only.
describe("the repository's runtime versions", () => {
  it("agree", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const problems = checkRuntimeVersions({
      nvmrc: readFileSync(".nvmrc", "utf8"),
      enginesNode: pkg.engines.node,
      packageManager: pkg.packageManager,
    });
    expect(problems).toStrictEqual([]);
  });
});
