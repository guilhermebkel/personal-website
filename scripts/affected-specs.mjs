import { readdirSync } from "node:fs";

const E2E_FOLDER = "e2e";
const SPEC_SUFFIX = ".spec.ts";

const NO_SPECS = [];

export const SPECS_BY_PATH_PREFIX = {
  "app/blog/": ["blog", "matrix"],
  "content/posts/": ["blog", "matrix"],
  "src/Utils/": NO_SPECS,
  "docs/": NO_SPECS,
  "GLOSSARY.md": NO_SPECS,
  "README.md": NO_SPECS,
  "AGENTS.md": NO_SPECS,
};

const SPEC_FILE = /^e2e\/([^/]+)\.spec\.ts$/;
const TEST_FILE = /\.test\.(ts|tsx|mjs)$/;

export const listAllSpecs = (root = ".") => {
  return readdirSync(`${root}/${E2E_FOLDER}`)
    .filter((name) => name.endsWith(SPEC_SUFFIX))
    .map((name) => name.slice(0, -SPEC_SUFFIX.length))
    .sort();
};

const findLongestPrefix = (path) => {
  const prefixes = Object.keys(SPECS_BY_PATH_PREFIX).filter((prefix) => path.startsWith(prefix));
  // Why: the longest matching prefix wins, so a folder can narrow the entry of its parent.
  return prefixes.sort((first, second) => second.length - first.length)[0];
};

const findSpecsForPath = (path) => {
  const spec = SPEC_FILE.exec(path);
  if (spec) {
    return [spec[1]];
  }
  if (TEST_FILE.test(path)) {
    return NO_SPECS;
  }
  const prefix = findLongestPrefix(path);
  // Why: a path with no entry could break any spec, so null means every spec runs; an empty list means none can break.
  return prefix === undefined ? null : SPECS_BY_PATH_PREFIX[prefix];
};

export const findAffectedSpecs = (changedPaths, everySpec) => {
  const selected = new Set();
  for (const path of changedPaths) {
    const specs = findSpecsForPath(path);
    if (specs === null) {
      return [...everySpec];
    }
    for (const spec of specs) {
      selected.add(spec);
    }
  }
  return everySpec.filter((spec) => selected.has(spec));
};
