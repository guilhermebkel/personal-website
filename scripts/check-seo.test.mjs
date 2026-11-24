import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildRoute, checkFeed, checkPage, checkSitemap, readPngSize } from "./check-seo.mjs";

const POST_ROUTE = "/blog/hello/";
const POST_URL = "https://guilherr.me/blog/hello/";
const GOOD_TITLE = "Hello, world · Guilherme Mota";
const GOOD_DESCRIPTION = "A description that is long enough to pass the rule of the standards, with words to spare.";
const POST_LD = '<script type="application/ld+json">{"@type":"BlogPosting"}</script>';
const SHORT_TITLE = "Short";
const SHORT_DESCRIPTION = "Too short.";
const OTHER_URL = "https://guilherr.me/other/";
const FEED_LINK = '<link rel="alternate" type="application/atom+xml" href="https://guilherr.me/feed.xml"/>';
const OG_IMAGE = '<meta property="og:image" content="https://guilherr.me/blog/hello/opengraph-image?abc"/>';
const NEWER_DATE = "2026-11-24T00:00:00Z";
const OLDER_DATE = "2026-11-01T00:00:00Z";
const PNG_HEADER_HEX = "89504e470d0a1a0a0000000d49484452";

const buildPage = ({
  title = GOOD_TITLE,
  description = GOOD_DESCRIPTION,
  canonical = POST_URL,
  ogUrl = canonical,
  extra = "",
  head = `${FEED_LINK}${OG_IMAGE}`,
} = {}) =>
  `<!doctype html><html lang="en"><head><title>${title}</title><meta name="description" content="${description}"/><link rel="canonical" href="${canonical}"/><meta property="og:url" content="${ogUrl}"/>${head}${extra}</head><body><h1>Hello</h1></body></html>`;

const buildPng = (width, height) => {
  const header = Buffer.from(PNG_HEADER_HEX, "hex");
  const sizes = Buffer.alloc(8);
  sizes.writeUInt32BE(width, 0);
  sizes.writeUInt32BE(height, 4);
  return Buffer.concat([header, sizes]);
};

const buildEntry = (id, published) =>
  `<entry><title>t</title><id>${id}</id><published>${published}</published><updated>${published}</updated></entry>`;

const buildFeed = (entries) =>
  `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><id>https://guilherr.me/</id>${entries}</feed>`;

describe("checkPage()", () => {
  it("passes a post with one title, a description, a canonical, its JSON-LD, a share image and the feed link", () => {
    const problems = checkPage(POST_ROUTE, buildPage({ extra: POST_LD }));
    expect(problems).toStrictEqual([]);
  });

  it("reports a title outside 10 to 65 characters", () => {
    const problems = checkPage(POST_ROUTE, buildPage({ title: SHORT_TITLE, extra: POST_LD }));
    expect(problems).toStrictEqual(["title: 5 characters, expected 10-65"]);
  });

  it("reports a description shorter than 70 characters", () => {
    const problems = checkPage(POST_ROUTE, buildPage({ description: SHORT_DESCRIPTION, extra: POST_LD }));
    expect(problems).toStrictEqual(["description: 10 characters, expected 70-175"]);
  });

  it("reports an og:url that differs from the canonical", () => {
    const problems = checkPage(POST_ROUTE, buildPage({ ogUrl: OTHER_URL, extra: POST_LD }));
    expect(problems).toStrictEqual(["og:url: must equal the canonical URL"]);
  });

  it("reports a post without BlogPosting JSON-LD", () => {
    const problems = checkPage(POST_ROUTE, buildPage());
    expect(problems).toStrictEqual([
      "json-ld: a post needs a BlogPosting",
      "json-ld: no script of type application/ld+json",
    ]);
  });

  it("reports a post without a share image", () => {
    const problems = checkPage(POST_ROUTE, buildPage({ extra: POST_LD, head: FEED_LINK }));
    expect(problems).toStrictEqual(["og:image: 0 found, expected one"]);
  });

  it("reports a share image that is not an absolute URL on the site", () => {
    const relative = '<meta property="og:image" content="/blog/hello/opengraph-image"/>';
    const problems = checkPage(POST_ROUTE, buildPage({ extra: POST_LD, head: `${FEED_LINK}${relative}` }));
    expect(problems).toStrictEqual(["og:image: must be an absolute https URL on the site"]);
  });

  it("reports a page that does not link the feed", () => {
    const problems = checkPage(POST_ROUTE, buildPage({ extra: POST_LD, head: OG_IMAGE }));
    expect(problems).toStrictEqual(["feed: the page must link the Atom feed once"]);
  });
});

describe("buildRoute()", () => {
  it("maps the built index files to their routes", () => {
    const home = join(process.cwd(), "out", "index.html");
    const post = join(process.cwd(), "out", "blog", "hello", "index.html");
    expect(buildRoute(home)).toBe("/");
    expect(buildRoute(post)).toBe("/blog/hello/");
  });
});

describe("readPngSize()", () => {
  it("reads the width and height from a PNG header", () => {
    const png = buildPng(1200, 630);
    expect(readPngSize(png)).toStrictEqual({ width: 1200, height: 630 });
  });

  it("returns null for a file that is not a PNG", () => {
    const svg = Buffer.from("<svg></svg>");
    expect(readPngSize(svg)).toBeNull();
  });
});

describe("checkSitemap()", () => {
  it("fails when a page is missing from the sitemap", () => {
    const xml = "<urlset><url><loc>https://guilherr.me/</loc></url></urlset>";
    const problems = checkSitemap(xml, ["/", POST_ROUTE]);
    expect(problems).toStrictEqual([`sitemap: ${POST_URL} is missing`]);
  });

  it("fails when a page is listed twice", () => {
    const xml = "<urlset><url><loc>https://guilherr.me/</loc></url><url><loc>https://guilherr.me/</loc></url></urlset>";
    const problems = checkSitemap(xml, ["/"]);
    expect(problems).toStrictEqual(["sitemap: a page is listed more than once"]);
  });
});

describe("checkFeed()", () => {
  const NEWER = "https://guilherr.me/blog/new/";
  const OLDER = "https://guilherr.me/blog/old/";
  const ROUTES = ["/blog/new/", "/blog/old/"];

  it("passes an Atom feed with each post once, newest first", () => {
    const feed = buildFeed(buildEntry(NEWER, NEWER_DATE) + buildEntry(OLDER, OLDER_DATE));
    expect(checkFeed(feed, ROUTES)).toStrictEqual([]);
  });

  it("reports a file that is not an Atom feed", () => {
    expect(checkFeed("<rss></rss>", [])).toStrictEqual(["feed: must be an Atom feed"]);
  });

  it("reports an ampersand that is not escaped", () => {
    const feed = buildFeed(buildEntry(NEWER, NEWER_DATE) + buildEntry(OLDER, OLDER_DATE)).replace(
      "<title>t</title>",
      "<title>Tom & Jerry</title>",
    );
    expect(checkFeed(feed, ROUTES)).toStrictEqual(["feed: an & in the text is not escaped"]);
  });

  it("reports a post that is missing from the feed", () => {
    const feed = buildFeed(buildEntry(NEWER, NEWER_DATE));
    expect(checkFeed(feed, ROUTES)).toStrictEqual(["feed: must list each of the 2 posts once"]);
  });

  it("reports entries that are not newest first", () => {
    const feed = buildFeed(buildEntry(OLDER, OLDER_DATE) + buildEntry(NEWER, NEWER_DATE));
    expect(checkFeed(feed, ROUTES)).toStrictEqual(["feed: entries must be newest first"]);
  });
});
