import { describe, expect, it } from "vitest";
import type { Post } from "@/Protocols/PostProtocol.ts";
import { AtomFeedUtil } from "@/Utils/AtomFeedUtil.ts";

const PUBLISHED = "2026-11-23";
const NEWER = "2026-11-24";
const TITLE = "Hello, world";

const buildPost = (overrides: Partial<Post> = {}): Post => ({
  slug: "hello",
  title: TITLE,
  date: PUBLISHED,
  summary: "A short summary.",
  tags: [],
  readingMinutes: 1,
  body: "",
  ...overrides,
});

describe("AtomFeedUtil.buildFeed()", () => {
  it("writes an Atom feed with one entry per post, in the order given", () => {
    const feed = AtomFeedUtil.buildFeed([
      buildPost({ slug: "new", date: NEWER }),
      buildPost({ slug: "old", date: "2026-11-01" }),
    ]);
    expect(feed.startsWith('<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom">')).toBe(
      true,
    );
    expect(feed.match(/<entry>/gu)).toHaveLength(2);
    expect(feed.indexOf("https://guilherr.me/blog/new/")).toBeLessThan(feed.indexOf("https://guilherr.me/blog/old/"));
  });

  it("gives each entry its link, id, dates and summary", () => {
    const feed = AtomFeedUtil.buildFeed([buildPost()]);
    expect(feed).toContain('<link rel="alternate" href="https://guilherr.me/blog/hello/"/>');
    expect(feed).toContain("<id>https://guilherr.me/blog/hello/</id>");
    expect(feed).toContain("<published>2026-11-23T00:00:00Z</published>");
    expect(feed).toContain("<summary>A short summary.</summary>");
  });

  it("uses the newest post for the feed's updated time", () => {
    const feed = AtomFeedUtil.buildFeed([buildPost({ date: NEWER })]);
    expect(feed).toContain(`<updated>${NEWER}T00:00:00Z</updated>`);
  });

  it("escapes &, <, > and quotes in the text so the XML stays valid", () => {
    const feed = AtomFeedUtil.buildFeed([buildPost({ title: 'Tom & "Jerry" <3 it\'s', summary: "a < b & c > d" })]);
    expect(feed).toContain("<title>Tom &amp; &quot;Jerry&quot; &lt;3 it&apos;s</title>");
    expect(feed).toContain("<summary>a &lt; b &amp; c &gt; d</summary>");
  });

  it("stays a valid feed with no posts", () => {
    const feed = AtomFeedUtil.buildFeed([]);
    expect(feed).not.toContain("<entry>");
    expect(feed).toContain("<updated>1970-01-01T00:00:00Z</updated>");
    expect(feed.endsWith("</feed>")).toBe(true);
  });

  it("gives an entry the update as its updated time and keeps the publication date as published", () => {
    const feed = AtomFeedUtil.buildFeed([buildPost({ date: "2021-03-21", updated: NEWER })]);

    expect(feed).toContain("<published>2021-03-21T00:00:00Z</published>");
    expect(feed).toContain(`<updated>${NEWER}T00:00:00Z</updated>`);
  });

  it("uses the most recent update of any post for the feed's updated time", () => {
    const feed = AtomFeedUtil.buildFeed([
      buildPost({ slug: "new", date: PUBLISHED }),
      buildPost({ slug: "rewritten", date: "2021-03-21", updated: "2026-11-25" }),
    ]);

    const header = feed.split("<entry>")[0];
    expect(header).toContain("<updated>2026-11-25T00:00:00Z</updated>");
  });
});
