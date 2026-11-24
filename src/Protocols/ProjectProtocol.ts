export type ProjectKind = "application" | "mcp" | "skill" | "library" | "game" | "other";

export type Project = {
  name: string;
  description: string;
  url: string;
  kind: ProjectKind;
  cover?: string;
  order?: number;
  updatedAt: string;
};
