import { describe, expect, it } from "vitest";
import { ProjectLabelUtil } from "@/Utils/ProjectLabelUtil.ts";

describe("ProjectLabelUtil.formatIndex()", () => {
  it("numbers the first project P/01", () => {
    expect(ProjectLabelUtil.formatIndex(0)).toBe("P/01");
  });

  it("keeps two digits from ten on", () => {
    expect(ProjectLabelUtil.formatIndex(9)).toBe("P/10");
  });
});

describe("ProjectLabelUtil.getHost()", () => {
  it("gives the host without the scheme and the path", () => {
    expect(ProjectLabelUtil.getHost("https://zerod.guilherr.me/room/abc")).toBe("zerod.guilherr.me");
  });
});
