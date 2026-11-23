// Why: .nvmrc, engines.node and packageManager each name a runtime version; a bump in one place and not the others is a silent mismatch.

const NVMRC_MAJOR = /^v?(\d+)(?:\.\d+){0,2}$/u;
const ENGINES_FLOOR_MAJOR = /^>=\s*(\d+)(?:\.\d+){0,2}$/u;
const PNPM_EXACT = /^pnpm@\d+\.\d+\.\d+$/u;

// Pure: returns one message per mismatch; an empty list means the three agree.
export const checkRuntimeVersions = ({ nvmrc, enginesNode, packageManager }) => {
  const problems = [];
  const nvmrcMatch = NVMRC_MAJOR.exec(nvmrc.trim());
  const enginesMatch = ENGINES_FLOOR_MAJOR.exec(enginesNode.trim());
  if (nvmrcMatch === null) {
    problems.push(`.nvmrc must name a Node major version, found "${nvmrc.trim()}".`);
  }
  if (enginesMatch === null) {
    problems.push(`engines.node must be a ">=<major>" range, found "${enginesNode.trim()}".`);
  }
  if (nvmrcMatch !== null && enginesMatch !== null && nvmrcMatch[1] !== enginesMatch[1]) {
    problems.push(`.nvmrc says Node ${nvmrcMatch[1]} but engines.node starts at ${enginesMatch[1]}.`);
  }
  if (!PNPM_EXACT.test(packageManager)) {
    problems.push(`packageManager must pin an exact pnpm version (pnpm@x.y.z), found "${packageManager}".`);
  }
  return problems;
};
