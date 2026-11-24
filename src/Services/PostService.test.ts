import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
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

    const posts = await new PostService(directory, directory).listPosts();
    const slugs = posts.map((post) => post.slug);

    expect(slugs).toStrictEqual(["new", "old"]);
  });

  it("ignores files that are not posts", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "notes.txt", "not a post");

    const posts = await new PostService(directory, directory).listPosts();

    expect(posts).toStrictEqual([]);
  });

  it("fails when the front-matter has no title", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "broken.md", "---\ndate: 2026-01-01\nsummary: x\n---\nBody\n");

    await expect(new PostService(directory, directory).listPosts()).rejects.toThrow(/title/u);
  });
});

describe("PostService.readPost()", () => {
  it("returns the front-matter, the body and the reading time", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "hello.md", buildPost("Hello", "2026-03-03"));

    const post = await new PostService(directory, directory).readPost("hello");

    expect(post).toMatchObject({
      slug: "hello",
      title: "Hello",
      date: "2026-03-03",
      tags: ["notes"],
      readingMinutes: 1,
    });
    expect(post.body).toContain("Body of Hello.");
  });
  it("reads the cover path of a post whose image exists", async () => {
    const directory = await createDirectory();
    const publicDirectory = await createDirectory();
    await mkdir(join(publicDirectory, "covers"));
    await writeInto(join(publicDirectory, "covers"), "a.png", "png");
    await writeInto(
      directory,
      "hello.md",
      `---\ntitle: Hello\ndate: 2026-01-01\nsummary: A summary.\ncover: /covers/a.png\n---\nBody.\n`,
    );
    const post = await new PostService(directory, publicDirectory).readPost("hello");
    expect(post.cover).toBe("/covers/a.png");
  });

  it("leaves the cover empty when the post has none", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "hello.md", buildPost("Hello", "2026-01-01"));
    const post = await new PostService(directory, directory).readPost("hello");
    expect(post.cover).toBeUndefined();
  });

  it("fails when the cover image is missing", async () => {
    const directory = await createDirectory();
    await writeInto(
      directory,
      "hello.md",
      `---\ntitle: Hello\ndate: 2026-01-01\nsummary: A summary.\ncover: /covers/missing.png\n---\nBody.\n`,
    );
    await expect(new PostService(directory, directory).readPost("hello")).rejects.toThrow(/cover file not found/u);
  });

  it("fails with a schema message when a post has no summary", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "nosummary.md", "---\ntitle: No summary\ndate: 2026-01-01\n---\nBody.\n");
    await expect(new PostService(directory, directory).readPost("nosummary")).rejects.toThrow(/summary/u);
  });
});
