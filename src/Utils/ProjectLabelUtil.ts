import type { ProjectKind } from "@/Protocols/ProjectProtocol.ts";

const KIND_TO_LABEL: Record<ProjectKind, string> = {
  application: "Application",
  mcp: "MCP server",
  skill: "Skill",
  library: "Library",
  game: "Game",
  other: "Other",
};

export class ProjectLabelUtil {
  static getKindLabel(kind: ProjectKind): string {
    return KIND_TO_LABEL[kind];
  }

  static getHost(url: string): string {
    return new URL(url).host;
  }
}
