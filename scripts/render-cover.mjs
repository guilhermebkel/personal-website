import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { COMPOSITIONS } from "./cover-compositions.mjs";

// Why: a post cover is an SVG drawn from the tokens, so it takes the same colors as the site and never needs an image editor.
const ROOT = process.cwd();
const WIDTH = 800;
const HEIGHT = 380;
const CENTER_X = 400;
const CENTER_Y = 190;
// Why: the post crop (about 2.7:1) and the card crop (about 1.75:1) both keep this area, so every shape is moved inside it.
const SAFE = { left: 70, right: 730, top: 45, bottom: 335 };
const PALETTE_TOKENS = ["purple", "purple-light", "cover-blue", "cover-green", "cover-orange"];
const GROUND_TOKEN = "lift";
const INK_TOKEN = "graphite";
const CONTOUR_TOKEN = "contour-cover-lift";
const ACCENT_LINE_TOKEN = "purple-light";
const DOT_TOKEN = "text-meta";
const TEXTURES = ["cover-grid", "cover-hatch", "cover-dots"];
const CONTOUR_LINES = 9;
const ACCENT_LINE = 4;
const WAVE_STEPS = 4;
const WAVE_AMPLITUDE = 22;
const LINE_WIDTH = 1.5;
const ACCENT_OPACITY = 0.7;
const DOT_RADIUS = 2.2;
const DOT_OPACITY = 0.6;
const CELL_PADDING = 5;
const SQUARE_CORNER_RATIO = 0.3;
const HALF_BASELINE_RATIO = 0.22;
const DEFAULT_OPACITY = 1;
const HALF = 0.5;
const PAIR = 2;
const QUARTER_TURN = 90;
const HALF_TURN = 180;
const FULL_TURN = Math.PI + Math.PI;
const WARM_UP = 4;
const SHIFT_LEFT_FIRST = 13;
const SHIFT_RIGHT = 17;
const SHIFT_LEFT_SECOND = 5;
const UINT32_RANGE = 4294967296;
const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;
const DECIMALS = 2;
const ARGUMENTS_OFFSET = 2;
const POSTS_DIR = "content/posts";
const COMPOSITION_PATTERN = /data-composition="([a-z-]+)"/u;
const POST_FILE_PATTERN = /\.md$/u;
const ROTATABLE_KINDS = new Set(["rect", "half", "quarter"]);

export const readTokenColor = (tokens, name) => {
  const token = tokens.color.tokens.find((candidate) => candidate.name === name);
  if (token === undefined) {
    throw new Error(`render-cover: no color token named "${name}"`);
  }
  return token.value;
};

const hashSlug = (slug) => {
  let hash = FNV_OFFSET;
  for (const character of slug) {
    hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), FNV_PRIME) >>> 0;
  }
  return hash;
};

const computeNextState = (state) => {
  const first = state ^ (state << SHIFT_LEFT_FIRST);
  const second = first ^ (first >>> SHIFT_RIGHT);
  return (second ^ (second << SHIFT_LEFT_SECOND)) >>> 0;
};

export const createRandom = (slug) => {
  // Why: the slug is the only input, so the same post always gets the same cover and a new build never changes it.
  const hash = hashSlug(slug);
  let state = hash === 0 ? 1 : hash;
  for (let turn = 0; turn < WARM_UP; turn += 1) {
    state = computeNextState(state);
  }
  return () => {
    state = computeNextState(state);
    return state / UINT32_RANGE;
  };
};

const resolveValue = (random, value, fallback) => {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value === "number") {
    return value;
  }
  return value.min + (value.max - value.min) * random();
};

const computeStray = (random, amplitude) => (random() - HALF) * PAIR * (amplitude ?? 0);

const buildShuffledPalette = (random) => {
  const palette = [...PALETTE_TOKENS];
  for (let index = palette.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [palette[index], palette[other]] = [palette[other], palette[index]];
  }
  return palette;
};

export const pickComposition = ({ random, avoid }) => {
  const avoidedIndex = COMPOSITIONS.findIndex((composition) => composition.name === avoid);
  const isAvoiding = avoidedIndex !== -1;
  const choices = isAvoiding ? COMPOSITIONS.length - 1 : COMPOSITIONS.length;
  const draw = Math.floor(random() * choices);
  return COMPOSITIONS[isAvoiding && draw >= avoidedIndex ? draw + 1 : draw];
};

const readPaletteColor = (context, index) => {
  const size = context.palette.length;
  // Why: a centered repeat gives its first copies a negative step, so the color index wraps in both directions.
  return context.palette[((Math.round(index) % size) + size) % size];
};

const buildShape = (context, fields) => ({
  kind: fields.kind,
  cx: fields.cx,
  cy: fields.cy,
  size: fields.size ?? 0,
  width: fields.width ?? 0,
  height: fields.height ?? 0,
  corner: fields.corner ?? 0,
  rotate: fields.rotate ?? 0,
  token: fields.token ?? readPaletteColor(context, fields.color ?? 0),
  opacity: fields.opacity ?? DEFAULT_OPACITY,
  isTextured: fields.isTextured ?? false,
  isFlipped: fields.isFlipped ?? false,
});

const resolveBase = (context, spec) => {
  const { random } = context;
  const width = resolveValue(random, spec.width, 0);
  const height = spec.isSquare === true ? width : resolveValue(random, spec.height, 0);
  return {
    left: resolveValue(random, spec.left, undefined),
    cx: resolveValue(random, spec.cx, CENTER_X),
    cy: resolveValue(random, spec.cy, CENTER_Y),
    size: resolveValue(random, spec.size, 0),
    rotate: resolveValue(random, spec.rotate, 0),
    width,
    height,
  };
};

const buildCopy = (context, { spec, base, factor }) => {
  const { random } = context;
  const jitter = spec.repeat?.jitter ?? {};
  const repeat = spec.repeat ?? {};
  const width = base.width + computeStray(random, jitter.width);
  const height = base.height + (repeat.dHeight ?? 0) * factor + computeStray(random, jitter.height);
  const left = base.left === undefined ? undefined : base.left + computeStray(random, jitter.left);
  const centerX = left === undefined ? base.cx + (repeat.dx ?? 0) * factor : left + width * HALF;
  return {
    ...spec,
    cx: centerX + computeStray(random, jitter.cx),
    cy: base.cy + (repeat.dy ?? 0) * factor + computeStray(random, jitter.cy),
    size: base.size + (repeat.dSize ?? 0) * factor,
    width,
    height,
    rotate: base.rotate,
    corner: spec.isPill === true ? height * HALF : spec.corner,
    color: (spec.color ?? 0) + (repeat.dColor ?? 0) * factor,
  };
};

const buildSplitHalves = (context, copy) => {
  const first = buildShape(context, { ...copy, kind: "half" });
  const second = buildShape(context, {
    ...copy,
    kind: "half",
    rotate: copy.rotate + HALF_TURN,
    color: copy.color + 1,
    isTextured: false,
  });
  return [first, second];
};

const buildSingleShape = (context, copy) => [buildShape(context, copy)];

const COPY_BUILDERS = { split: buildSplitHalves };

const buildShapes = (context, spec) => {
  const base = resolveBase(context, spec);
  const rawCount = resolveValue(context.random, spec.repeat?.count, 1);
  const count = Math.round(rawCount);
  const middle = spec.repeat?.isCentered === true ? (count - 1) * HALF : 0;
  return Array.from({ length: count }, (_, index) => {
    const copy = buildCopy(context, { spec, base, factor: index - middle });
    const textured =
      spec.repeat?.texturedIndex === undefined
        ? spec.isTextured
        : index === (spec.repeat.texturedIndex + count) % count;
    const resolved = { ...copy, isTextured: textured ?? false };
    const buildCopies = COPY_BUILDERS[spec.kind] ?? buildSingleShape;
    return buildCopies(context, resolved);
  }).flat();
};

const buildCell = (context, { kind, centerX, centerY, cell }) => {
  const color = Math.floor(context.random() * PALETTE_TOKENS.length);
  const isTextured = context.random() < context.texturedChance;
  const radius = cell * HALF - CELL_PADDING;
  const cells = {
    dot: { kind: "circle", size: DOT_RADIUS, token: DOT_TOKEN, opacity: DOT_OPACITY, cx: centerX, cy: centerY },
    square: {
      kind: "rect",
      width: cell - CELL_PADDING * PAIR,
      height: cell - CELL_PADDING * PAIR,
      corner: cell * SQUARE_CORNER_RATIO,
      cx: centerX,
      cy: centerY,
      color,
      isTextured,
    },
    circle: { kind: "circle", size: radius, cx: centerX, cy: centerY, color, isTextured },
    half: { kind: "half", size: radius, cx: centerX, cy: centerY + cell * HALF_BASELINE_RATIO, color, isTextured },
    quarter: {
      kind: "quarter",
      size: cell,
      cx: centerX,
      cy: centerY,
      rotate: Math.floor(context.random() * PAIR * PAIR) * QUARTER_TURN,
      color,
      isTextured,
    },
  };
  return buildShape(context, cells[kind]);
};

const buildGridShapes = (context, spec) => {
  const rawColumns = resolveValue(context.random, spec.columns, 1);
  const columns = Math.round(rawColumns);
  const rows = spec.rows;
  const left = CENTER_X - columns * spec.cell * HALF;
  const top = CENTER_Y - rows * spec.cell * HALF;
  const gridContext = { ...context, texturedChance: spec.texturedChance ?? 0 };
  const shapes = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const isSkipped = context.random() < (spec.skipChance ?? 0);
      const kind = spec.cells[Math.floor(context.random() * spec.cells.length)];
      const centerX = left + (column + HALF) * spec.cell;
      const centerY = top + (row + HALF) * spec.cell;
      if (!isSkipped) {
        shapes.push(buildCell(gridContext, { kind, centerX, centerY, cell: spec.cell }));
      }
    }
  }
  return shapes;
};

const EXPANDERS = { grid: buildGridShapes };

const applyDrift = (context, composition, shapes) => {
  const driftX = resolveValue(context.random, composition.drift.cx, 0);
  const driftY = resolveValue(context.random, composition.drift.cy, 0);
  return shapes.map((shape) => ({ ...shape, cx: shape.cx + driftX, cy: shape.cy + driftY }));
};

const applyTilt = (context, composition, shapes) => {
  const tilt = resolveValue(context.random, composition.tilt, 0);
  const radians = (tilt * Math.PI) / HALF_TURN;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return shapes.map((shape) => {
    const offsetX = shape.cx - CENTER_X;
    const offsetY = shape.cy - CENTER_Y;
    return {
      ...shape,
      cx: CENTER_X + offsetX * cosine - offsetY * sine,
      cy: CENTER_Y + offsetX * sine + offsetY * cosine,
      rotate: ROTATABLE_KINDS.has(shape.kind) ? shape.rotate + tilt : shape.rotate,
    };
  });
};

const readRectBounds = (shape) => {
  const radians = (shape.rotate * Math.PI) / HALF_TURN;
  const halfWidth =
    Math.abs(shape.width * Math.cos(radians)) * HALF + Math.abs(shape.height * Math.sin(radians)) * HALF;
  const halfHeight =
    Math.abs(shape.width * Math.sin(radians)) * HALF + Math.abs(shape.height * Math.cos(radians)) * HALF;
  return {
    left: shape.cx - halfWidth,
    right: shape.cx + halfWidth,
    top: shape.cy - halfHeight,
    bottom: shape.cy + halfHeight,
  };
};

const readHalfBounds = (shape) => {
  const left = shape.cx - shape.size;
  const right = shape.cx + shape.size;
  if (shape.rotate !== 0) {
    return { left, right, top: shape.cy - shape.size, bottom: shape.cy + shape.size };
  }
  if (shape.isFlipped) {
    return { left, right, top: shape.cy, bottom: shape.cy + shape.size };
  }
  return { left, right, top: shape.cy - shape.size, bottom: shape.cy };
};

const BOUNDS = {
  circle: (shape) => ({
    left: shape.cx - shape.size,
    right: shape.cx + shape.size,
    top: shape.cy - shape.size,
    bottom: shape.cy + shape.size,
  }),
  half: readHalfBounds,
  rect: readRectBounds,
  arch: (shape) => ({
    left: shape.cx - shape.width * HALF,
    right: shape.cx + shape.width * HALF,
    top: shape.cy - shape.height,
    bottom: shape.cy,
  }),
  quarter: (shape) => ({
    left: shape.cx - shape.size * HALF,
    right: shape.cx + shape.size * HALF,
    top: shape.cy - shape.size * HALF,
    bottom: shape.cy + shape.size * HALF,
  }),
};

export const readBounds = (shape) => BOUNDS[shape.kind](shape);

const applyFit = (shapes) => {
  const all = shapes.map(readBounds);
  const left = Math.min(...all.map((bounds) => bounds.left));
  const right = Math.max(...all.map((bounds) => bounds.right));
  const top = Math.min(...all.map((bounds) => bounds.top));
  const bottom = Math.max(...all.map((bounds) => bounds.bottom));
  const shiftX = Math.max(SAFE.left - left, 0) - Math.max(right - SAFE.right, 0);
  const shiftY = Math.max(SAFE.top - top, 0) - Math.max(bottom - SAFE.bottom, 0);
  return shapes.map((shape) => ({ ...shape, cx: shape.cx + shiftX, cy: shape.cy + shiftY }));
};

const formatNumber = (value) => {
  const rounded = Number(value.toFixed(DECIMALS));
  return String(rounded);
};

const buildPaths = {
  circle: (shape) => {
    const { cx, cy, size } = shape;
    const arc = `a${formatNumber(size)} ${formatNumber(size)} 0 1 0`;
    return `M${formatNumber(cx - size)} ${formatNumber(cy)}${arc} ${formatNumber(size * PAIR)} 0${arc} ${formatNumber(-size * PAIR)} 0z`;
  },
  half: (shape) => {
    const sweep = shape.isFlipped ? 0 : 1;
    const radius = formatNumber(shape.size);
    return `M${formatNumber(shape.cx - shape.size)} ${formatNumber(shape.cy)}a${radius} ${radius} 0 0 ${sweep} ${formatNumber(shape.size * PAIR)} 0z`;
  },
  rect: (shape) => {
    const corner = Math.min(shape.corner, shape.width * HALF, shape.height * HALF);
    const left = shape.cx - shape.width * HALF;
    const top = shape.cy - shape.height * HALF;
    const arc = `a${formatNumber(corner)} ${formatNumber(corner)} 0 0 1`;
    const straightX = formatNumber(shape.width - corner * PAIR);
    const straightY = formatNumber(shape.height - corner * PAIR);
    const start = `M${formatNumber(left + corner)} ${formatNumber(top)}`;
    return `${start}h${straightX}${arc} ${formatNumber(corner)} ${formatNumber(corner)}v${straightY}${arc} ${formatNumber(-corner)} ${formatNumber(corner)}h${formatNumber(-(shape.width - corner * PAIR))}${arc} ${formatNumber(-corner)} ${formatNumber(-corner)}v${formatNumber(-(shape.height - corner * PAIR))}${arc} ${formatNumber(corner)} ${formatNumber(-corner)}z`;
  },
  arch: (shape) => {
    const radius = shape.width * HALF;
    const left = shape.cx - radius;
    return `M${formatNumber(left)} ${formatNumber(shape.cy)}V${formatNumber(shape.cy - shape.height + radius)}a${formatNumber(radius)} ${formatNumber(radius)} 0 0 1 ${formatNumber(shape.width)} 0V${formatNumber(shape.cy)}z`;
  },
  quarter: (shape) => {
    const left = shape.cx - shape.size * HALF;
    const top = shape.cy - shape.size * HALF;
    return `M${formatNumber(left)} ${formatNumber(top)}h${formatNumber(shape.size)}a${formatNumber(shape.size)} ${formatNumber(shape.size)} 0 0 1 ${formatNumber(-shape.size)} ${formatNumber(shape.size)}z`;
  },
};

const buildTransform = (shape) => {
  if (shape.rotate === 0) {
    return "";
  }
  return ` transform="rotate(${formatNumber(shape.rotate)} ${formatNumber(shape.cx)} ${formatNumber(shape.cy)})"`;
};

const renderShape = (shape, { tokens, texture }) => {
  const pathData = buildPaths[shape.kind](shape);
  const transform = buildTransform(shape);
  const opacity = shape.opacity === DEFAULT_OPACITY ? "" : ` fill-opacity="${shape.opacity}"`;
  const fill = `<path d="${pathData}" fill="${readTokenColor(tokens, shape.token)}"${opacity}${transform}/>`;
  const overlay = shape.isTextured ? `<path d="${pathData}" fill="url(#${texture})"${transform}/>` : "";
  return `${fill}${overlay}`;
};

const buildTextureDefs = (tokens) => {
  const ink = readTokenColor(tokens, INK_TOKEN);
  return [
    `<pattern id="cover-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="${ink}" stroke-opacity=".6" stroke-width="1.2"/></pattern>`,
    `<pattern id="cover-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0V10" stroke="${ink}" stroke-opacity=".4" stroke-width="2"/></pattern>`,
    `<pattern id="cover-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.8" fill="${ink}" fill-opacity=".55"/></pattern>`,
  ].join("");
};

const buildContour = ({ random, tokens }) => {
  const phase = random() * FULL_TURN;
  return Array.from({ length: CONTOUR_LINES }, (_, line) => {
    const baseY = ((line + HALF) / CONTOUR_LINES) * HEIGHT;
    const points = Array.from({ length: WAVE_STEPS + 1 }, (ignored, step) => {
      const pointX = (step / WAVE_STEPS) * WIDTH;
      return `${formatNumber(pointX)} ${formatNumber(baseY + Math.sin(phase + step + line) * WAVE_AMPLITUDE)}`;
    });
    const isAccent = line === ACCENT_LINE;
    const stroke = readTokenColor(tokens, isAccent ? ACCENT_LINE_TOKEN : CONTOUR_TOKEN);
    const opacity = isAccent ? ` stroke-opacity="${ACCENT_OPACITY}"` : "";
    return `<path d="M${points.join(" L")}" fill="none" stroke="${stroke}"${opacity} stroke-width="${LINE_WIDTH}"/>`;
  }).join("");
};

export const buildCover = ({ slug, tokens, avoid }) => {
  const random = createRandom(slug);
  const palette = buildShuffledPalette(random);
  const texture = TEXTURES[Math.floor(random() * TEXTURES.length)];
  const composition = pickComposition({ random, avoid });
  const context = { random, palette, texturedChance: 0 };
  const expanded = composition.shapes.flatMap((spec) =>
    spec.kind in EXPANDERS ? EXPANDERS[spec.kind](context, spec) : buildShapes(context, spec),
  );
  const drifted = applyDrift(context, composition, expanded);
  const tilted = applyTilt(context, composition, drifted);
  const shapes = applyFit(tilted);
  const drawn = shapes.map((shape) => renderShape(shape, { tokens, texture })).join("");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" data-composition="${composition.name}">`,
    `<defs>${buildTextureDefs(tokens)}</defs>`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${readTokenColor(tokens, GROUND_TOKEN)}"/>`,
    buildContour({ random, tokens }),
    drawn,
    "</svg>",
  ].join("");
  return { composition: composition.name, svg, shapes };
};

export const readComposition = (svg) => COMPOSITION_PATTERN.exec(svg)?.[1];

const readPosts = (root) =>
  readdirSync(join(root, POSTS_DIR))
    .filter((file) => POST_FILE_PATTERN.test(file))
    .map((file) => {
      const postPath = join(root, POSTS_DIR, file);
      const { data } = matter(readFileSync(postPath, "utf8"));
      // Why: gray-matter reads an unquoted YAML date as a Date, so it is written back as an ISO day to sort as text.
      const date = data.date instanceof Date ? data.date.toISOString() : String(data.date);
      return { slug: file.replace(POST_FILE_PATTERN, ""), cover: data.cover, date };
    })
    .sort((first, second) => first.date.localeCompare(second.date) || first.slug.localeCompare(second.slug));

export const findPreviousComposition = ({ root, slug }) => {
  const posts = readPosts(root);
  const position = posts.findIndex((post) => post.slug === slug);
  // Why: a new post has no file yet, so the one before it is the latest post; a post that exists follows the one dated before it.
  const previous = position === -1 ? posts.at(-1) : posts[position - 1];
  if (previous?.cover === undefined || !previous.cover.endsWith(".svg")) {
    return undefined;
  }
  const coverPath = join(root, "public", previous.cover);
  return readComposition(readFileSync(coverPath, "utf8"));
};

const isMain = () => process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  // Why: the slug and, when the post has no file yet, nothing else are arguments, so the script reads no environment variable.
  const [slug] = process.argv.slice(ARGUMENTS_OFFSET);
  const output = join("public/covers", `${slug}.svg`);
  const tokensPath = join(ROOT, "design/system/tokens.json");
  const tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  const avoid = findPreviousComposition({ root: ROOT, slug });
  const { svg, composition } = buildCover({ slug, tokens, avoid });
  const outputPath = join(ROOT, output);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, svg);
  const note = avoid === undefined ? composition : `${composition}, not ${avoid}`;
  process.stdout.write(`render-cover: wrote ${output} (${note})\n`);
}
