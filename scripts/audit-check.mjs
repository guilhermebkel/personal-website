import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Why: exit codes are the contract with the CI job; 2 is "the audit did not answer", which must never pass.
export const EXIT_OK = 0;
export const EXIT_BLOCKED = 1;
export const EXIT_NO_ANSWER = 2;

const BLOCKING_LEVELS = ["high", "critical"];
const SCOPES = new Set(["prod", "dev"]);

// Why: pnpm audit prints the npm-style report on stdout; an unreachable registry prints an error object or nothing parseable.
export const parseAuditOutput = (stdout) => {
  try {
    const report = JSON.parse(stdout);
    return report;
  } catch {
    return null;
  }
};

export const countBlocking = (vulnerabilities) => {
  return BLOCKING_LEVELS.reduce((total, level) => total + (vulnerabilities[level] ?? 0), 0);
};

// Pure: decides the exit code and the lines to print from a parsed report. No network here.
export const evaluateAudit = ({ scope, report }) => {
  if (!SCOPES.has(scope)) {
    return { code: EXIT_NO_ANSWER, lines: [`Unknown audit scope "${scope}": use prod or dev.`] };
  }
  if (report === null || typeof report !== "object") {
    return {
      code: EXIT_NO_ANSWER,
      lines: [`The ${scope} audit did not answer with a report: the audit service may be unreachable. Retry the job.`],
    };
  }
  if (report.error !== undefined) {
    const summary = report.error.summary ?? report.error.code ?? "unknown error";
    return { code: EXIT_NO_ANSWER, lines: [`The ${scope} audit failed: ${summary}.`] };
  }
  const vulnerabilities = report.metadata?.vulnerabilities;
  if (vulnerabilities === undefined) {
    return { code: EXIT_NO_ANSWER, lines: [`The ${scope} audit report has no vulnerability counts.`] };
  }
  const blocking = countBlocking(vulnerabilities);
  if (blocking === 0) {
    return { code: EXIT_OK, lines: [`No high or critical ${scope} vulnerabilities.`] };
  }
  if (scope === "prod") {
    return { code: EXIT_BLOCKED, lines: [`${blocking} high or critical vulnerabilities in production dependencies.`] };
  }
  // Why: a development dependency never ships, so it warns in the job log and the job stays green.
  return {
    code: EXIT_OK,
    lines: [`::warning::${blocking} high or critical vulnerabilities in development dependencies.`],
  };
};

const runAudit = (scope) => {
  const result = spawnSync("pnpm", ["audit", "--json", `--${scope}`], { encoding: "utf8" });
  return parseAuditOutput(result.stdout ?? "");
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const scope = process.argv[2];
  const { code, lines } = evaluateAudit({ scope, report: runAudit(scope) });
  for (const line of lines) {
    process.stdout.write(`${line}\n`);
  }
  process.exit(code);
}
