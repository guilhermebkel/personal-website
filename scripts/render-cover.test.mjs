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

describe("render-cover", () => {
  it("draws the cover with the token colors and the title", () => {
    const svg = buildCoverSvg({ title: "Hello world", topic: "meta", tokens: TOKENS });
    expect(svg).toContain('fill="#1b1b1e"');
    expect(svg).toContain('stroke="#5328fe"');
    expect(svg).toContain("Hello world");
    expect(svg).not.toMatch(/#[0-9a-f]{6}.*#[0-9a-f]{6}.*#zzz/u);
  });

  it("gives the same phase to the same topic and another phase to another topic", () => {
    expect(readPhase("meta")).toBe(readPhase("meta"));
    expect(readPhase("meta")).not.toBe(readPhase("design"));
  });

  it("wraps a long title over at most two lines", () => {
    const lines = wrapTitle("Giving an agent a read-only window into the Brazilian market in one line");
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines[0]).toContain("Giving");
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
