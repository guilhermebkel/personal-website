export const COLOR_TO_REASON = {
  "#c9bdff": "the selected chip count of the projects filter, not on the site",
  "#9a9aa0": "the logo caption of the reference board LogoRound, not on the site",
  "#3a3a40":
    "the control border of the boards (border-strong in the prototype); the site uses #6e6e74 because #3a3a40 is 1.52:1 on graphite, below the 3:1 of a control border",
  "#000": "the stop of a gradient mask (the fade of the contour field), not a color on screen",
  "rgba(255,255,255,0.035)": "a faint hairline of the hero, used twice and not reused",
  "rgba(83,40,254,0.22)": "the purple edge of the hero, used twice and not reused",
  "rgba(83,40,254,0.35)": "the purple edge of the hero, used twice and not reused",
};

// Why: a short hex color (#abc) is written out to six digits, so it reads the same as a long one.
const SHORT_HEX_LENGTH = 3;
const DATA_URI = /data:[^"'()\s]+/gu;
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/gu;

export const normalizeColor = (raw) => {
  // Why: pure, so the tests need no files or browser. one spelling per color: lowercase, no spaces, a leading zero on alpha, six-digit hex.
  const compact = raw.toLowerCase().replaceAll(/\s+/gu, "");
  if (compact.startsWith("#")) {
    const digits = compact.slice(1);
    return digits.length === SHORT_HEX_LENGTH ? `#${[...digits].map((digit) => digit + digit).join("")}` : compact;
  }
  return compact.replaceAll(/(?<=[,(])\./gu, "0.");
};

export const countBoardColors = (html) => {
  // Why: pure, so the tests need no files or browser. the colors of one board, counted; base64 images are removed first, they are not colors.
  const colorToCount = new Map();
  for (const match of html.replaceAll(DATA_URI, "").matchAll(COLOR)) {
    const color = normalizeColor(match[0]);
    colorToCount.set(color, (colorToCount.get(color) ?? 0) + 1);
  }
  return colorToCount;
};

export const findUnknownColors = ({ census, tokenValues }) => {
  // Why: pure, so the tests need no files or browser. the colors of the boards that are neither a color token nor a documented exception, sorted.
  const known = new Set([...tokenValues.map(normalizeColor), ...Object.keys(COLOR_TO_REASON).map(normalizeColor)]);
  return [...census.keys()].filter((color) => !known.has(color)).sort();
};

export const getTokenColorValues = (tokens) => tokens.color.tokens.map((token) => token.value);
