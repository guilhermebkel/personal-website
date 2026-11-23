import { readdirSync, readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { censusOfBoard, normalizeColor, tokenColorValues, unknownColors } from "./prototype-colors.mjs";

const TOKENS = JSON.parse(readFileSync("design/system/tokens.json", "utf8"));
const TOKEN_VALUES = tokenColorValues(TOKENS);
const BOARD_DIR = "design/prototype";

describe("normalizeColor()", () => {
  it("reads the same color written in two spellings as one", () => {
    expect(normalizeColor("#FFF")).toBe("#ffffff");
    expect(normalizeColor("rgba(255, 255, 255, .04)")).toBe("rgba(255,255,255,0.04)");
    expect(normalizeColor("rgba(255, 255, 255, 0.04)")).toBe("rgba(255,255,255,0.04)");
  });
});

describe("censusOfBoard()", () => {
  it("counts each color of a board and ignores base64 images", () => {
    const html = `<p style="color:#fff">a</p><p style="color:#FFF">b</p><img src="data:image/png;base64,iVBORw0#abcdef">`;
    expect(censusOfBoard(html)).toStrictEqual(new Map([["#ffffff", 2]]));
  });
});

describe("unknownColors()", () => {
  it("accepts a color that is a token", () => {
    const census = censusOfBoard(`<p style="color:#8C8C93"></p>`);
    expect(unknownColors({ census, tokenValues: TOKEN_VALUES })).toStrictEqual([]);
  });

  it("accepts a documented exception", () => {
    const census = censusOfBoard(`<p style="color:#C9BDFF"></p>`);
    expect(unknownColors({ census, tokenValues: TOKEN_VALUES })).toStrictEqual([]);
  });

  it("fails on a color that is neither", () => {
    const census = censusOfBoard(`<p style="color:#123456"></p>`);
    expect(unknownColors({ census, tokenValues: TOKEN_VALUES })).toStrictEqual(["#123456"]);
  });
});

// Why: every color of every board must be a token or a documented exception; this test reads the boards in the repository.
describe("the prototype boards", () => {
  it("use only the color tokens and the documented exceptions", () => {
    const boards = readdirSync(BOARD_DIR).filter((name) => name.endsWith(".dc.html"));
    const unknown = boards.flatMap((name) => {
      const census = censusOfBoard(readFileSync(`${BOARD_DIR}/${name}`, "utf8"));
      return unknownColors({ census, tokenValues: TOKEN_VALUES }).map((color) => `${name}: ${color}`);
    });
    expect(unknown).toStrictEqual([]);
  });
});
