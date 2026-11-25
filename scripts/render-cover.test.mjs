import { describe, expect, it } from "vitest";
import { buildCoverSvg, readPhase, wrapTitle } from "./render-cover.mjs";

const TOKENS = {
  color: {
    tokens: [
      { name: "graphite", value: "#1b1b1e" },
      { name: "text-meta", value: "#6f6f78" },
      { name: "text-strong", value: "#f2f2f2" },
      { name: "purple", value: "#5328fe" },
    ],
  },
};

const TITLE = "Hello world";

describe("render-cover", () => {
  it("draws the cover with the token colors and the title", () => {
    const svg = buildCoverSvg({ title: TITLE, topic: "meta", tokens: TOKENS });
    expect(svg).toContain('fill="#1b1b1e"');
    expect(svg).toContain('stroke="#5328fe"');
    expect(svg).toContain(TITLE);
    expect(svg).not.toMatch(/#[0-9a-f]{6}.*#[0-9a-f]{6}.*#zzz/u);
  });

  it("gives the same phase to the same topic and another phase to another topic", () => {
    expect(readPhase("meta")).toBe(readPhase("meta"));
    expect(readPhase("meta")).not.toBe(readPhase("design"));
  });

  it("wraps a title by words over two lines, keeping every word", () => {
    const lines = wrapTitle("Team Harness That Ships Faster and Keeps Quality");
    expect(lines).toStrictEqual(["Team Harness That Ships", "Faster and Keeps Quality"]);
  });

  it("fails for a title that needs more than two lines, instead of dropping its last words", () => {
    expect(() => wrapTitle("Giving an agent a read-only window into the Brazilian market in one line")).toThrow(
      /needs 4 lines/u,
    );
  });

  it("draws the title in the site's embedded font", () => {
    const svg = buildCoverSvg({ title: TITLE, topic: "meta", tokens: TOKENS });
    expect(svg).toContain("@font-face");
    expect(svg).toContain('font-family="Ubuntu, sans-serif"');
  });

  it("escapes the title so it cannot break the markup", () => {
    const svg = buildCoverSvg({ title: "A <b> & c", topic: "x", tokens: TOKENS });
    expect(svg).toContain("A &lt;b&gt; &amp; c");
  });

  it("fails for a missing color token", () => {
    expect(() => buildCoverSvg({ title: "t", topic: "x", tokens: { color: { tokens: [] } } })).toThrow(
      /no color token/u,
    );
  });
});
