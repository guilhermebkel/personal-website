import { describe, it, expect } from "vitest";
import { USAGE, listFreshPngs, noCaptureMessage, parseVisualArgs } from "./visual-component.mjs";

const BUTTON_RENDER = "test-results/visual-renders/Button.tsx";

describe("parseVisualArgs()", () => {
  it("takes the render file as the one argument", () => {
    expect(parseVisualArgs([BUTTON_RENDER])).toStrictEqual({ file: BUTTON_RENDER });
  });

  it("prints the usage line when no argument is given", () => {
    expect(parseVisualArgs([])).toStrictEqual({ error: USAGE });
  });
});

describe("listFreshPngs()", () => {
  const entries = [
    { name: "Button-rest.png", path: "test-results/visual/Button-rest.png", mtimeMs: 2000 },
    { name: "Tag.png", path: "test-results/visual/Tag.png", mtimeMs: 500 },
    { name: "notes.txt", path: "test-results/visual/notes.txt", mtimeMs: 2000 },
  ];

  it("lists only the PNGs written at or after the start of the run", () => {
    expect(listFreshPngs({ entries, sinceMs: 1000 })).toStrictEqual(["test-results/visual/Button-rest.png"]);
  });

  it("lists nothing when the run wrote no PNG", () => {
    expect(listFreshPngs({ entries, sinceMs: 9000 })).toStrictEqual([]);
  });
});

describe("noCaptureMessage()", () => {
  it("names the render file", () => {
    expect(noCaptureMessage(BUTTON_RENDER)).toBe(`No capture came from ${BUTTON_RENDER}`);
  });
});
