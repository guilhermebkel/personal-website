import { describe, it, expect } from "vitest";
import { isSharedRoot, buildCheckPlan } from "./check-changed.mjs";

describe("buildCheckPlan()", () => {
  it("checks only the changed files when nothing shared changed", () => {
    expect(
      buildCheckPlan({ base: "abc", changedPaths: ["src/Utils/TimeUtil.ts", "components/SiteNav.tsx"] }),
    ).toStrictEqual({ kind: "changed", base: "abc" });
  });

  it("runs the full check and says why when the base cannot be resolved", () => {
    expect(buildCheckPlan({ base: null, changedPaths: [] })).toStrictEqual({
      kind: "full",
      reason: "origin/main could not be resolved",
    });
  });

  it.each([
    "package.json",
    "pnpm-lock.yaml",
    "tsconfig.json",
    "eslint.config.mjs",
    ".oxlintrc.json",
    "vitest.config.mjs",
    "playwright.config.ts",
    "lint-staged.config.mjs",
    "scripts/affected-specs.mjs",
    "src/Protocols/PostProtocol.ts",
    ".github/workflows/ci.yml",
  ])("runs the full check when %s changed", (path) => {
    expect(buildCheckPlan({ base: "abc", changedPaths: ["src/Utils/TimeUtil.ts", path] })).toStrictEqual({
      kind: "full",
      reason: `${path} is a shared root`,
    });
  });
});

describe("isSharedRoot()", () => {
  it("leaves ordinary source files out", () => {
    expect(isSharedRoot("src/Protocolsish.ts")).toBe(false);
    expect(isSharedRoot("components/package.json.tsx")).toBe(false);
  });
});
