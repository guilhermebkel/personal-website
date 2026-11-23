const CLASS_SELECTOR_PATTERN = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/gu;
const COMMENT_PATTERN = /\/\*[\s\S]*?\*\//gu;

export const findClassSelectors = (css) => {
  // Why: a class selector in globals.css would apply to every screen, so every selector is listed to be checked.
  const preludes = css
    .replace(COMMENT_PATTERN, "")
    .split("{")
    .map((chunk) => chunk.split("}").at(-1).split(";").at(-1).trim())
    .filter((prelude) => prelude !== "" && !prelude.startsWith("@"));
  return preludes.flatMap((prelude) => [...prelude.matchAll(CLASS_SELECTOR_PATTERN)].map((match) => match[1]));
};

const COLOR_FUNCTIONS = ["oklch(", "oklab(", "rgb(", "rgba(", "hsl(", "hsla(", "hwb(", "lab(", "lch("];
const HEX_COLOR = /#[\da-f]{3,8}\b/iu;
const OUTLINE_REMOVAL = /^(?:none|0)$/u;
const REDUCED_MOTION_QUERY = "@media (prefers-reduced-motion: reduce)";
const REDUCED_MOTION_PROPERTIES = ["animation-duration", "transition-duration", "scroll-behavior"];

const findBlocks = (css) => {
  // Why: every "}" ends the innermost block, so the text before it holds that block's selector and body, even when nested.
  return css.replace(COMMENT_PATTERN, "").split("}").flatMap((chunk) => {
    const open = chunk.lastIndexOf("{");
    if (open === -1) {
      return [];
    }
    const before = chunk.slice(0, open);
    return [{ selector: before.slice(before.lastIndexOf("{") + 1).trim(), body: chunk.slice(open + 1) }];
  });
};

const findDeclarations = (css) => {
  return findBlocks(css).flatMap(({ selector, body }) => body.split(";").flatMap((declaration) => {
    const colon = declaration.indexOf(":");
    const property = declaration.slice(0, colon).trim();
    return colon === -1 ? [] : [{ selector, property, value: declaration.slice(colon + 1).trim() }];
  }));
};

export const findRawColorDeclarations = (css) => {
  // Why: a raw color outside the tokens would not follow the theme, so only custom properties may hold one.
  return findDeclarations(css).filter(({ property, value }) => {
    const isCustomProperty = property.startsWith("--");
    const hasRawColor = COLOR_FUNCTIONS.some((name) => value.includes(name)) || HEX_COLOR.test(value);
    return !isCustomProperty && hasRawColor;
  });
};

export const findOutlineRemovals = (css) => {
  return findDeclarations(css).filter(({ property, value }) => property === "outline" && OUTLINE_REMOVAL.test(value.split(" ")[0]));
};

export const hasFocusVisibleOutline = (css) => {
  return findDeclarations(css).some(({ selector, property }) => selector.includes(":focus-visible") && property === "outline");
};

export const hasReducedMotionReset = (css) => {
  const stripped = css.replace(COMMENT_PATTERN, "");
  const start = stripped.indexOf(REDUCED_MOTION_QUERY);
  const block = start === -1 ? "" : stripped.slice(start);
  return REDUCED_MOTION_PROPERTIES.every((property) => block.includes(property));
};

const LAYOUT_PROPERTIES = ["width", "height", "top", "left", "margin"];
const TRANSITION_PROPERTIES = ["transition", "transition-property"];
const TRANSITION_ALL_CLASS = /(?<![\w-])transition-all(?![\w-])/gu;
const TRANSITION_LIST_CLASS = /(?<![\w-])transition-\[([^\]]+)\]/gu;

const isLayoutProperty = (name) => {
  return LAYOUT_PROPERTIES.some((layout) => name === layout || name.startsWith(`${layout}-`) || name.startsWith(`min-${layout}`) || name.startsWith(`max-${layout}`));
};

const listTransitionedNames = (list) => {
  // Why: a transition value is "name duration easing, name ...", so the names are the first word of each comma-separated item.
  return list.split(",").map((item) => item.trim().split(/[\s_]+/u)[0]).filter((name) => name !== "");
};

export const findMotionViolations = (css) => {
  // Why: `transition: all` and a layout property run on the main thread and shift what is around them, so only listed, compositor-friendly properties may move.
  return findDeclarations(css).filter(({ property, value }) => {
    return TRANSITION_PROPERTIES.includes(property) && listTransitionedNames(value).some((name) => name === "all" || isLayoutProperty(name));
  });
};

export const findMotionClassViolations = (source) => {
  // Why: the screens write their transitions as Tailwind classes, so the same rule is checked on those.
  const all = [...source.matchAll(TRANSITION_ALL_CLASS)].map((match) => match[0]);
  const layout = [...source.matchAll(TRANSITION_LIST_CLASS)]
    .filter((match) => match[1].split(",").some((name) => isLayoutProperty(name.trim())))
    .map((match) => match[0]);
  return [...all, ...layout];
};
