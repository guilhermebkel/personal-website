// Why: the census is pure, so the caller reads the files and the tests need none.

// Why: each exception is a color the boards use that is not a site color, with the reason; a new color in a board fails the census.
export const COLOR_EXCEPTIONS = {
  "#c9bdff": "the selected chip count of the projects filter, not on the site",
  "#9a9aa0": "the logo caption of the reference board LogoRound, not on the site",
  "#000": "the stop of a gradient mask (the fade of the contour field), not a color on screen",
  "rgba(255,255,255,0.035)": "a faint hairline of the hero, used twice and not reused",
  "rgba(83,40,254,0.22)": "the purple edge of the hero, used twice and not reused",
  "rgba(83,40,254,0.35)": "the purple edge of the hero, used twice and not reused",
};

// Why: a short hex color (#abc) is written out to six digits, so it reads the same as a long one.
const SHORT_HEX_LENGTH = 3;
const DATA_URI = /data:[^"'()\s]+/gu;
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/gu;

// Why: pure, so the tests need no files or browser. one spelling per color: lowercase, no spaces, a leading zero on alpha, six-digit hex.
export const normalizeColor = (raw) => {
  const compact = raw.toLowerCase().replaceAll(/\s+/gu, "");
  if (compact.startsWith("#")) {
    const digits = compact.slice(1);
    return digits.length === SHORT_HEX_LENGTH ? `#${[...digits].map((digit) => digit + digit).join("")}` : compact;
  }
  return compact.replaceAll(/(?<=[,(])\./gu, "0.");
};

// Why: pure, so the tests need no files or browser. the colors of one board, counted; base64 images are removed first, they are not colors.
export const countBoardColors = (html) => {
  const counts = new Map();
  for (const match of html.replaceAll(DATA_URI, "").matchAll(COLOR)) {
    const color = normalizeColor(match[0]);
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }
  return counts;
};

// Why: pure, so the tests need no files or browser. the colors of the boards that are neither a color token nor a documented exception, sorted.
export const findUnknownColors = ({ census, tokenValues }) => {
  const known = new Set([...tokenValues.map(normalizeColor), ...Object.keys(COLOR_EXCEPTIONS).map(normalizeColor)]);
  return [...census.keys()].filter((color) => !known.has(color)).sort();
};

export const getTokenColorValues = (tokens) => tokens.color.tokens.map((token) => token.value);
