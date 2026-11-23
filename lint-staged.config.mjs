import { relative } from "node:path";
import { findAffectedSpecs, listAllSpecs } from "./scripts/affected-specs.mjs";

const SOURCE_FILES = "**/*.{ts,tsx,mjs}";
const TYPESCRIPT_FILES = "**/*.{ts,tsx}";
const ANY_FILE = "**/*";

const quote = (files) => {
  // Why: lint-staged passes absolute paths and runs a string command without a shell, so each path is quoted by hand.
  return files.map((file) => JSON.stringify(file)).join(" ");
};

const getRelativePath = (cwd, files) => {
  return files.map((file) => relative(cwd, file));
};

export const buildLintCommand = (files) => {
  // Why: Oxlint and ESLint both run through scripts/lint.mjs; no `--fix`, so the working tree stays as it was.
  return `node scripts/lint.mjs --max-warnings=0 ${quote(files)}`;
};

export const buildRelatedTestsCommand = (files) => {
  // Why: a change nothing imports (a script, a config) has no related test, and that is not a failure.
  return `vitest related --run --passWithNoTests ${quote(files)}`;
};

export const buildTypecheckCommand = () => {
  // Why: `tsc` given file names ignores tsconfig.json, so the typecheck gets none and checks the whole project (incremental).
  return "tsc --noEmit";
};

export const buildQualityCommand = () => {
  // Why: knip, jscpd and dpdm read the whole project, never a file list.
  return "pnpm quality";
};

export const buildE2eCommands = (files, cwd = process.cwd()) => {
  const specs = findAffectedSpecs(getRelativePath(cwd, files), listAllSpecs(cwd));
  if (specs.length === 0) {
    return [];
  }
  const specFiles = specs.map((spec) => `e2e/${spec}.spec.ts`);
  // Why: Playwright starts a server on a fixed port, so every changed file goes into one process, and the server serves the build in `out/`.
  return ["pnpm build", `pnpm test:e2e -- ${specFiles.join(" ")}`];
};

export default {
  [SOURCE_FILES]: [buildLintCommand, buildRelatedTestsCommand, buildQualityCommand],
  [TYPESCRIPT_FILES]: buildTypecheckCommand,
  [ANY_FILE]: buildE2eCommands,
};
