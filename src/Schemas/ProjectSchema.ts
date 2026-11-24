import { z } from "zod";
import type { ProjectKind } from "@/Protocols/ProjectProtocol.ts";

export const PROJECT_KINDS: [ProjectKind, ...ProjectKind[]] = [
  "application",
  "mcp",
  "skill",
  "library",
  "game",
  "other",
];

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  kind: z.enum(PROJECT_KINDS),
  tags: z.array(z.string().min(1)).default([]),
  // Why: the cover is a path under public/, like the cover of a post.
  cover: z.string().startsWith("/").optional(),
  // Why: the owner picks the order of the Projects section; a project without it comes after the ordered ones.
  order: z.number().int().positive().optional(),
  updatedAt: z.iso.datetime(),
});
