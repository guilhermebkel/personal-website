import { z } from "zod";

const ISO_DATE_LENGTH = 10;

// Why: the YAML parser turns an unquoted `2026-03-03` into a Date, so both spellings must give the same ISO string.
const PostDateSchema = z.union([
  z.date().transform((date) => date.toISOString().slice(0, ISO_DATE_LENGTH)),
  z.iso.date(),
]);

export const PostFrontMatterSchema = z
  .object({
    title: z.string().min(1),
    date: PostDateSchema,
    // Why: `updated` is set when the content changed after publishing, so readers, search engines and the feed see the change; a typo fix does not need it.
    updated: PostDateSchema.optional(),
    summary: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    cover: z.string().startsWith("/").optional(),
  })
  .refine((post) => post.updated === undefined || post.updated >= post.date, {
    message: "updated must not be earlier than date",
    path: ["updated"],
  });
