import { describe, expect, it } from "vitest";
import { LINK_CLASS } from "@styles/LinkClasses.ts";

describe("LINK_CLASS", () => {
  it("sweeps the marker on hover, press and the current page, only where a pointer exists", () => {
    expect(LINK_CLASS).toContain("md:hover:before:scale-x-100");
    expect(LINK_CLASS).toContain("md:active:before:scale-x-100");
    expect(LINK_CLASS).toContain("aria-[current=page]:before:scale-x-100");
  });

  it("makes the target 44 px tall on a phone without moving the text", () => {
    expect(LINK_CLASS).toContain("max-md:-my-3");
    expect(LINK_CLASS).toContain("max-md:py-3");
  });

  it("shows the marker on keyboard focus and drops it when disabled", () => {
    expect(LINK_CLASS).toContain("focus-visible:before:scale-x-100");
    expect(LINK_CLASS).toContain("aria-disabled:before:scale-x-0");
  });
});
