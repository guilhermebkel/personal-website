import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PostService } from "@/Services/PostService.ts";

const buildPost = (title: string, date: string) => {
  return `---\ntitle: ${title}\ndate: ${date}\nsummary: A summary.\ntags: [notes]\n---\nBody of ${title}.\n`;
};

const createDirectory = async () => {
  const prefix = join(tmpdir(), "posts-");
  return await mkdtemp(prefix);
};

const writeInto = async (directory: string, name: string, content: string) => {
  const path = join(directory, name);
  await writeFile(path, content);
};

describe("PostService.listPosts()", () => {
  it("lists the newest post first", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "old.md", buildPost("Old", "2026-01-01"));
    await writeInto(directory, "new.md", buildPost("New", "2026-06-01"));

    const posts = await new PostService(directory).listPosts();
    const slugs = posts.map((post) => post.slug);

    expect(slugs).toStrictEqual(["new", "old"]);
  });

  it("ignores files that are not posts", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "notes.txt", "not a post");

    const posts = await new PostService(directory).listPosts();

    expect(posts).toStrictEqual([]);
  });

  it("fails when the front-matter has no title", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "broken.md", "---\ndate: 2026-01-01\nsummary: x\n---\nBody\n");

    await expect(new PostService(directory).listPosts()).rejects.toThrow(/title/u);
  });
});

describe("PostService.readPost()", () => {
  it("returns the front-matter, the body and the reading time", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "hello.md", buildPost("Hello", "2026-03-03"));

    const post = await new PostService(directory).readPost("hello");

    expect(post).toMatchObject({
      slug: "hello",
      title: "Hello",
      date: "2026-03-03",
      tags: ["notes"],
      readingMinutes: 1,
    });
    expect(post.body).toContain("Body of Hello.");
  });
});
