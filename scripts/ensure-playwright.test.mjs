import { describe, it, expect, vi } from "vitest";
import { ensurePlaywrightChromium, runChromiumInstall, isChromiumInstalledAt } from "./ensure-playwright.mjs";

const PLAYWRIGHT = ["exec", "playwright"];
const WITH_DEPS = "--with-deps";

describe("isChromiumInstalledAt()", () => {
  it("is false when the executable file is missing", () => {
    expect(isChromiumInstalledAt("/tmp/tocomevidencia-missing-chromium-executable")).toBe(false);
  });
});

describe("ensurePlaywrightChromium()", () => {
  it("returns 0 without installing when chromium is already present", () => {
    const install = vi.fn();
    const result = ensurePlaywrightChromium({ isInstalled: () => true, install });

    expect(result).toBe(0);
    expect(install).not.toHaveBeenCalled();
  });

  it("installs when chromium is missing", () => {
    const install = vi.fn(() => 0);
    const result = ensurePlaywrightChromium({ isInstalled: () => false, install });

    expect(result).toBe(0);
    expect(install).toHaveBeenCalledOnce();
  });
});

describe("runChromiumInstall()", () => {
  it("runs install with deps first", () => {
    const calls = [];
    const spawn = vi.fn((args) => {
      calls.push(args);
      return { status: args.includes(WITH_DEPS) ? 0 : 1 };
    });

    expect(runChromiumInstall({ spawn })).toBe(0);
    expect(calls).toStrictEqual([[...PLAYWRIGHT, "install", WITH_DEPS, "chromium"]]);
  });

  it("falls back to install chromium and install-deps when --with-deps fails", () => {
    const calls = [];
    const spawn = vi.fn((args) => {
      calls.push(args);
      if (args.includes(WITH_DEPS)) {
        return { status: 1 };
      }
      return { status: 0 };
    });

    expect(runChromiumInstall({ spawn })).toBe(0);
    expect(calls).toStrictEqual([
      [...PLAYWRIGHT, "install", WITH_DEPS, "chromium"],
      [...PLAYWRIGHT, "install", "chromium"],
      [...PLAYWRIGHT, "install-deps", "chromium"],
    ]);
  });
});
