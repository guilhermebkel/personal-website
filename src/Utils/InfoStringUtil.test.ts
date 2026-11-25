import { describe, expect, it } from "vitest";
import { InfoStringUtil } from "@/Utils/InfoStringUtil.ts";

describe("InfoStringUtil.readQuoted()", () => {
  it("reads the quoted value of a named option", () => {
    expect(InfoStringUtil.readQuoted(' title="AGENTS.md" collapsed', "title")).toBe("AGENTS.md");
  });

  it("returns undefined when the option is missing or there is no info string", () => {
    expect(InfoStringUtil.readQuoted(" collapsed", "title")).toBeUndefined();
    expect(InfoStringUtil.readQuoted(undefined, "title")).toBeUndefined();
  });
});

describe("InfoStringUtil.hasFlag()", () => {
  it("finds a bare word option, not a part of another word", () => {
    expect(InfoStringUtil.hasFlag(' title="x" collapsed', "collapsed")).toBe(true);
    expect(InfoStringUtil.hasFlag(' title="uncollapsed-notes"', "collapsed")).toBe(false);
  });
});
