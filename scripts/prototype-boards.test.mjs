import { describe, it, expect } from "vitest";
import {
  BOARD_MAPPING,
  boardsForRoutes,
  captureFileName,
  loadBoards,
  mappedBoardNames,
  resolveBoardNames,
} from "./prototype-boards.mjs";

// Why: a small canvas in the artifact's shape, so the tests never read the repository's boards.
const CANVAS = {
  boards: {
    "Intro.dc.html": { w: 1440, h: 900, title: "Seção 1 · Intro (desktop)" },
    "IntroMobile.dc.html": { w: 390, h: 844, title: "Seção 1 · Intro (mobile)" },
    "LogoRound.dc.html": { w: 1440, h: 700, title: "Logo" },
  },
};
const BOARDS = loadBoards(CANVAS);

describe("loadBoards()", () => {
  it("lists one board per file, named without the extension and sorted by name", () => {
    expect(BOARDS.map((board) => board.name)).toStrictEqual(["Intro", "IntroMobile", "LogoRound"]);
    expect(BOARDS[0]).toStrictEqual({
      name: "Intro",
      file: "Intro.dc.html",
      title: "Seção 1 · Intro (desktop)",
      width: 1440,
      height: 900,
    });
  });
});

describe("resolveBoardNames()", () => {
  it("returns every board when none is named", () => {
    expect(resolveBoardNames({ requested: [], boards: BOARDS }).names).toStrictEqual([
      "Intro",
      "IntroMobile",
      "LogoRound",
    ]);
  });

  it("returns only the named boards, with or without the extension", () => {
    expect(resolveBoardNames({ requested: ["Intro", "IntroMobile.dc.html"], boards: BOARDS })).toStrictEqual({
      names: ["Intro", "IntroMobile"],
    });
  });

  it("rejects an unknown board and lists the valid ones", () => {
    const result = resolveBoardNames({ requested: ["Nope"], boards: BOARDS });
    expect(result.error).toBe("Unknown board: Nope. Valid boards: Intro, IntroMobile, LogoRound.");
  });
});

describe("the board mapping", () => {
  it("maps every mapped board to a route and a width", () => {
    for (const mapping of Object.values(BOARD_MAPPING)) {
      expect(mapping.route.startsWith("/")).toBe(true);
      expect([390, 1440]).toContain(mapping.width);
    }
  });

  it("maps the prototype's boards exactly once, and leaves the two reference boards out", () => {
    const allBoards = loadBoards({
      boards: Object.fromEntries(
        [...Object.keys(BOARD_MAPPING), "LogoRound", "Curvas"].map((name) => [`${name}.dc.html`, { w: 1, h: 1 }]),
      ),
    });
    expect(mappedBoardNames(allBoards)).toStrictEqual(Object.keys(BOARD_MAPPING).sort());
    expect(mappedBoardNames(allBoards)).not.toContain("LogoRound");
    expect(mappedBoardNames(allBoards)).not.toContain("Curvas");
  });
});

describe("boardsForRoutes()", () => {
  it("selects the mapped boards of a route", () => {
    expect(boardsForRoutes({ routes: ["/"], boards: BOARDS })).toStrictEqual({ names: ["Intro", "IntroMobile"] });
  });

  it("rejects a route no board is mapped to", () => {
    expect(boardsForRoutes({ routes: ["/nope/"], boards: BOARDS }).error).toContain("No board is mapped to: /nope/");
  });
});

describe("captureFileName()", () => {
  it("names the board PNG and the site or compare PNGs of a board", () => {
    expect(captureFileName("Intro")).toBe("test-results/prototype/Intro.png");
    expect(captureFileName("Intro", "site")).toBe("test-results/prototype/Intro.site.png");
    expect(captureFileName("Intro", "compare")).toBe("test-results/prototype/Intro.compare.png");
  });
});
