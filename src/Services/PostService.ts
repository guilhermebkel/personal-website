import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import type { Post } from "@/Protocols/PostProtocol.ts";
import { PostFrontMatterSchema } from "@/Schemas/PostSchema.ts";
import { ReadingTimeUtil } from "@/Utils/ReadingTimeUtil.ts";

const POST_EXTENSION = ".md";

export class PostService {
  constructor(private readonly postsDirectory: string) {}

  async listPosts(): Promise<Post[]> {
    const names = await readdir(this.postsDirectory);
    const files = names.filter((name) => name.endsWith(POST_EXTENSION));
    const slugs = files.map((file) => file.slice(0, -POST_EXTENSION.length));
    const posts = await Promise.all(slugs.map((slug) => this.readPost(slug)));
    // Why: the newest post comes first; ISO dates sort as plain strings.
    return posts.sort((first, second) => second.date.localeCompare(first.date));
  }

  async readPost(slug: string): Promise<Post> {
    const source = await readFile(join(this.postsDirectory, `${slug}${POST_EXTENSION}`), "utf8");
    const parsed = matter(source);
    // Why: a post with a bad front-matter must fail the build, not render half-empty.
    const frontMatter = PostFrontMatterSchema.parse(parsed.data);
    return {
      slug,
      ...frontMatter,
      readingMinutes: ReadingTimeUtil.countMinutes(parsed.content),
      body: parsed.content,
    };
  }
}
