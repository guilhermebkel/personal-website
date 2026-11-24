import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildRoute, checkPage, checkSitemap } from "./check-seo.mjs";

const POST_ROUTE = "/blog/hello/";
const POST_URL = "https://guilherr.me/blog/hello/";
const GOOD_TITLE = "Hello, world · Guilherme Mota";
const GOOD_DESCRIPTION = "A description that is long enough to pass the rule of the standards, with words to spare.";
const POST_LD = '<script type="application/ld+json">{"@type":"BlogPosting"}</script>';
const SHORT_TITLE = "Short";
const SHORT_DESCRIPTION = "Too short.";
const OTHER_URL = "https://guilherr.me/other/";

const buildPage = ({
  title = GOOD_TITLE,
  description = GOOD_DESCRIPTION,
  canonical = POST_URL,
  ogUrl = canonical,
  extra = "",
} = {}) =>
  `<!doctype html><html lang="en"><head><title>${title}</title><meta name="description" content="${description}"/><link rel="canonical" href="${canonical}"/><meta property="og:url" content="${ogUrl}"/>${extra}</head><body><h1>Hello</h1></body></html>`;

describe("checkPage()", () => {
  it("passes a post with one title, a description, a canonical and its JSON-LD", () => {
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
});

describe("buildRoute()", () => {
  it("maps the built index files to their routes", () => {
    const home = join(process.cwd(), "out", "index.html");
    const post = join(process.cwd(), "out", "blog", "hello", "index.html");
    expect(buildRoute(home)).toBe("/");
    expect(buildRoute(post)).toBe("/blog/hello/");
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
