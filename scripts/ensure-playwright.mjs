import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const getChromiumExecutablePath = () => chromium.executablePath();

export const isChromiumInstalledAt = (executablePath) => existsSync(executablePath);

export const isChromiumInstalled = () => {
  try {
    return isChromiumInstalledAt(getChromiumExecutablePath());
  } catch {
    return false;
  }
};

const runPnpmCommand = (args) => spawnSync("pnpm", args, { stdio: "inherit" });

export const runChromiumInstall = ({ spawn = runPnpmCommand } = {}) => {
  const runPlaywright = (...playwrightArgs) => {
    const result = spawn(["exec", "playwright", ...playwrightArgs]);
    return result.status ?? 1;
  };

  if (runPlaywright("install", "--with-deps", "chromium") === 0) {
    return 0;
  }
  if (runPlaywright("install", "chromium") !== 0) {
    return 1;
  }
  return runPlaywright("install-deps", "chromium");
};

export const ensurePlaywrightChromium = ({ isInstalled = isChromiumInstalled, install = runChromiumInstall } = {}) => {
  if (isInstalled()) {
    return 0;
  }
  return install();
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(ensurePlaywrightChromium());
}
