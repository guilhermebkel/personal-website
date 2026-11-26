import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMPOSITIONS } from "./cover-compositions.mjs";
import {
  buildCover,
  createRandom,
  pickComposition,
  readBounds,
  readComposition,
  readTokenColor,
} from "./render-cover.mjs";

const TOKENS = JSON.parse(readFileSync(new URL("../design/system/tokens.json", import.meta.url), "utf8"));
const SAMPLE_SIZE = 300;
const SAFE = { left: 70, right: 730, top: 45, bottom: 335 };

const buildSlugs = () => Array.from({ length: SAMPLE_SIZE }, (_, index) => `post-${index}`);

describe("render-cover", () => {
  it("draws the same cover for the same slug", () => {
    const first = buildCover({ slug: "same-slug", tokens: TOKENS });
    const second = buildCover({ slug: "same-slug", tokens: TOKENS });
    expect(first.svg).toBe(second.svg);
  });

  it("draws another cover for another slug", () => {
    const first = buildCover({ slug: "one", tokens: TOKENS });
    const second = buildCover({ slug: "two", tokens: TOKENS });
    expect(first.svg).not.toBe(second.svg);
  });

  it("uses only token colors and writes no text", () => {
    const { svg } = buildCover({ slug: "colors", tokens: TOKENS });
    const known = new Set(TOKENS.color.tokens.map((token) => token.value.toLowerCase()));
    const used = svg.match(/#[0-9a-f]{6}/giu) ?? [];
    expect(used.every((color) => known.has(color.toLowerCase()))).toBe(true);
    expect(svg).not.toContain("<text");
  });

  it("keeps every shape inside the safe area", () => {
    const outside = buildSlugs().flatMap((slug) => {
      const { shapes } = buildCover({ slug, tokens: TOKENS });
      return shapes.filter((shape) => {
        const bounds = readBounds(shape);
        return (
          bounds.left < SAFE.left - 1 ||
          bounds.right > SAFE.right + 1 ||
          bounds.top < SAFE.top - 1 ||
          bounds.bottom > SAFE.bottom + 1
        );
      });
    });
    expect(outside).toHaveLength(0);
  });

  it("never repeats the composition to avoid", () => {
    const repeated = COMPOSITIONS.flatMap(({ name }) =>
      buildSlugs()
        .slice(0, 20)
        .filter((slug) => pickComposition({ random: createRandom(slug), avoid: name }).name === name),
    );
    expect(repeated).toHaveLength(0);
  });

  it("stores the composition in the svg so the next post can avoid it", () => {
    const { svg, composition } = buildCover({ slug: "stored", tokens: TOKENS });
    expect(readComposition(svg)).toBe(composition);
  });

  it("reads a token color and fails for an unknown one", () => {
    expect(readTokenColor(TOKENS, "graphite")).toMatch(/^#[0-9a-f]{6}$/iu);
    expect(() => readTokenColor(TOKENS, "nope")).toThrow(/no color token named "nope"/u);
  });
});
