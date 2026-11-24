import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

export const PERF_PORT = 3102;
export const PERF_ROUTES = ["/", "/blog/", "/blog/hello-world/"];
// Why: the scores are Lighthouse's 0 to 1 category scores; accessibility is 1 because a lower score is a finding, not a budget.
export const SCORE_BUDGETS = { performance: 0.95, accessibility: 1, "best-practices": 0.95, seo: 0.95 };
// Why: the timings are read on the phone profile only, where the page is slowest; they are in the units Lighthouse reports (ms, unitless CLS).
export const MOBILE_TIMING_BUDGETS = {
  "largest-contentful-paint": 2000,
  "cumulative-layout-shift": 0.02,
  "total-blocking-time": 200,
};
const SERVER_ATTEMPTS = 100;
const SERVER_RETRY_MS = 100;
// Why: the phone profile is Lighthouse's default; the desktop profile is its desktop config.
const PROFILE_CONFIG = { mobile: undefined, desktop: desktopConfig };

export const findBudgetFailures = ({ route, profile, scores, timings }) => {
  const label = `${route} (${profile})`;
  const scoreFailures = Object.entries(SCORE_BUDGETS)
    .filter(([category, budget]) => scores[category] < budget)
    .map(([category, budget]) => `${label} ${category} ${scores[category]} < ${budget}`);
  const timingFailures = Object.entries(MOBILE_TIMING_BUDGETS)
    .filter(([audit, budget]) => profile === "mobile" && timings[audit] > budget)
    .map(([audit, budget]) => `${label} ${audit} ${timings[audit]} > ${budget}`);
  return [...scoreFailures, ...timingFailures];
};

const readResult = (lhr) => {
  const scores = Object.fromEntries(Object.entries(lhr.categories).map(([name, category]) => [name, category.score]));
  const timings = Object.fromEntries(
    Object.keys(MOBILE_TIMING_BUDGETS).map((audit) => [audit, lhr.audits[audit].numericValue]),
  );
  return { scores, timings };
};

const waitForServer = async (url) => {
  // Why: the server starts in the background; the loop retries the connection, it does not sleep for a fixed time.
  for (let attempt = 0; attempt < SERVER_ATTEMPTS; attempt += 1) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, SERVER_RETRY_MS));
    }
  }
  throw new Error(`perf: the server at ${url} did not start.`);
};

const startChrome = async () => {
  try {
    return await chromeLauncher.launch({
      chromePath: chromium.executablePath(),
      chromeFlags: ["--headless=new", "--no-sandbox"],
    });
  } catch (error) {
    throw new Error(`perf: Chromium cannot start (${error.message}). Run pnpm ensure-playwright.`, { cause: error });
  }
};

const runProfiles = async ({ chrome, route }) => {
  const failures = [];
  for (const profile of Object.keys(PROFILE_CONFIG)) {
    const flags = { port: chrome.port, output: "json", logLevel: "error" };
    const runnerResult = await lighthouse(`http://localhost:${PERF_PORT}${route}`, flags, PROFILE_CONFIG[profile]);
    const { scores, timings } = readResult(runnerResult.lhr);
    process.stdout.write(`${route} ${profile}: ${JSON.stringify(scores)} ${JSON.stringify(timings)}\n`);
    failures.push(...findBudgetFailures({ route, profile, scores, timings }));
  }
  return failures;
};

const isMain = () => {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
};

if (isMain()) {
  const server = spawn("pnpm", ["exec", "serve", "out", "-l", String(PERF_PORT)], { stdio: "ignore" });
  const chrome = await startChrome();
  const failures = [];
  try {
    await waitForServer(`http://localhost:${PERF_PORT}/`);
    for (const route of PERF_ROUTES) {
      failures.push(...(await runProfiles({ chrome, route })));
    }
  } finally {
    await chrome.kill();
    server.kill();
  }
  for (const failure of failures) {
    process.stderr.write(`over budget: ${failure}\n`);
  }
  if (failures.length > 0) {
    process.exit(1);
  }
}
