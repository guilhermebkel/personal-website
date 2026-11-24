import { describe, expect, it } from "vitest";
import { ProjectLabelUtil } from "@/Utils/ProjectLabelUtil.ts";

describe("ProjectLabelUtil.getKindLabel()", () => {
  it("names an MCP project 'MCP server'", () => {
    expect(ProjectLabelUtil.getKindLabel("mcp")).toBe("MCP server");
  });

  it("capitalizes the other kinds", () => {
    expect(ProjectLabelUtil.getKindLabel("application")).toBe("Application");
  });
});

describe("ProjectLabelUtil.getHost()", () => {
  it("gives the host without the scheme and the path", () => {
    expect(ProjectLabelUtil.getHost("https://zerod.guilherr.me/room/abc")).toBe("zerod.guilherr.me");
  });
});
