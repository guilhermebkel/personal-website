import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  language: z.string().min(1).nullable(),
  updatedAt: z.iso.datetime(),
});
