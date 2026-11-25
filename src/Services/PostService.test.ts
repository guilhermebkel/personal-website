import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PostService } from "@/Services/PostService.ts";

const SUMMARY = "A summary.";
const UPDATED = "2026-11-24";
const OLD_DATE = "2026-01-01";
const PUBLISHED = "2021-03-21";

const buildPost = (title: string, date: string) => {
  return `---\ntitle: ${title}\ndate: ${date}\nsummary: ${SUMMARY}\ntags: [notes]\n---\nBody of ${title}.\n`;
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
    await writeInto(directory, "old.md", buildPost("Old", OLD_DATE));
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
    await writeInto(directory, "hello.md", buildPost("Hello", OLD_DATE));
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

  it("reads an updated date that is later than the publication, quoted or not", async () => {
    const directory = await createDirectory();
    await writeInto(
      directory,
      "rewritten.md",
      `---\ntitle: Rewritten\ndate: ${PUBLISHED}\nupdated: "${UPDATED}"\nsummary: A summary.\n---\nBody.\n`,
    );
    await writeInto(
      directory,
      "unquoted.md",
      `---\ntitle: Unquoted\ndate: ${PUBLISHED}\nupdated: ${UPDATED}\nsummary: A summary.\n---\nBody.\n`,
    );

    const service = new PostService(directory, directory);

    expect((await service.readPost("rewritten")).updated).toBe(UPDATED);
    expect((await service.readPost("unquoted")).updated).toBe(UPDATED);
  });

  it("leaves updated undefined when the post has none", async () => {
    const directory = await createDirectory();
    await writeInto(directory, "plain.md", buildPost("Plain", OLD_DATE));

    expect((await new PostService(directory, directory).readPost("plain")).updated).toBeUndefined();
  });

  it("fails the build, naming the post, when updated is earlier than date", async () => {
    const directory = await createDirectory();
    await writeInto(
      directory,
      "backwards.md",
      `---\ntitle: Backwards\ndate: 2026-06-01\nupdated: 2026-01-01\nsummary: A summary.\n---\nBody.\n`,
    );

    await expect(new PostService(directory, directory).readPost("backwards")).rejects.toThrow(
      /post "backwards".*updated must not be earlier than date/u,
    );
  });
  it("replaces a mermaid block with the picture the build renders for it", async () => {
    const directory = await createDirectory();
    const body = "Intro.\n\n```mermaid\nflowchart LR\n  A --> B\n```\n";
    await writeInto(directory, "flow.md", `---\ntitle: Flow\ndate: ${PUBLISHED}\nsummary: ${SUMMARY}\n---\n${body}`);

    const post = await new PostService(directory, directory).readPost("flow");

    expect(post.body).not.toContain("```mermaid");
    expect(post.body).toMatch(/!\[Diagram\]\(\/diagrams\/flow\/[0-9a-f]{16}\.svg\)/u);
  });
});
