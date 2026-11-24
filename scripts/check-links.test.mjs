import { describe, it, expect } from "vitest";
import { findBrokenReferences, resolveReference } from "./check-links.mjs";

const buildSite = ({ pages, files }) => ({
  routeToHtml: new Map(Object.entries(pages)),
  files: new Set(files),
});

describe("findBrokenReferences()", () => {
  describe("a built site whose links all exist", () => {
    it("reports nothing, ignoring the query string of a file and the external links", () => {
      const site = buildSite({
        pages: {
          "/": '<main id="main"><a href="/blog/">Posts</a><a href="#main">Skip</a><img src="/icon.svg?v=1"></main>',
          "/blog/": '<main id="main"><a href="https://github.com/guilhermebkel">GitHub</a></main>',
        },
        files: ["/", "/blog/", "/icon.svg"],
      });

      expect(findBrokenReferences(site)).toStrictEqual([]);
    });
  });

  describe("a link to a page that is not built", () => {
    it("names the page and the link", () => {
      const site = buildSite({
        pages: { "/": '<a href="/blog/does-not-exist/">Gone</a>' },
        files: ["/"],
      });

      expect(findBrokenReferences(site)).toStrictEqual(["/ -> /blog/does-not-exist/"]);
    });
  });

  describe("a fragment with no id on its own page", () => {
    it("names the missing id", () => {
      const site = buildSite({
        pages: { "/": '<main id="main"><a href="#missing">Jump</a></main>' },
        files: ["/"],
      });

      expect(findBrokenReferences(site)).toStrictEqual(['/ -> #missing (no id "missing")']);
    });
  });

  describe("a fragment on another page", () => {
    it("checks the ids of the page it points to", () => {
      const site = buildSite({
        pages: {
          "/": '<a href="/blog/#top">Top</a>',
          "/blog/": '<h1 id="title">Posts</h1>',
        },
        files: ["/", "/blog/"],
      });

      expect(findBrokenReferences(site)).toStrictEqual(['/ -> /blog/#top (no id "top")']);
    });
  });
});

describe("resolveReference()", () => {
  describe("a relative fragment", () => {
    it("stays on the page it is written on", () => {
      expect(resolveReference("#projects", "/blog/")).toStrictEqual({
        external: false,
        target: "/blog/",
        fragment: "projects",
      });
    });
  });

  describe("an external address", () => {
    it("is not followed", () => {
      expect(resolveReference("mailto:someone@example.com", "/")).toStrictEqual({ external: true });
    });
  });
});
