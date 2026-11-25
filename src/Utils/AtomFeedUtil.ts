import type { Post } from "@/Protocols/PostProtocol.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

type XmlCharacter = "&" | "<" | ">" | '"' | "'";

const ATOM_NAMESPACE = "http://www.w3.org/2005/Atom";
const FEED_PATH = "/feed.xml";
const BLOG_PATH = "/blog/";
const HOME_PATH = "/";
const EMPTY_UPDATED = "1970-01-01T00:00:00Z";
const XML_CHARACTER_TO_ESCAPE: Record<XmlCharacter, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const XML_SPECIAL_CHARACTERS = /[&<>"']/gu;

const buildRfc3339 = (date: string) => `${date}T00:00:00Z`;

const escapeXml = (text: string) =>
  text.replace(XML_SPECIAL_CHARACTERS, (character) => XML_CHARACTER_TO_ESCAPE[character as XmlCharacter]);

export class AtomFeedUtil {
  static buildFeed(posts: Post[]): string {
    // Why: the posts arrive newest first from PostService, so the feed keeps that order and its first entry is the latest post.
    // Why: Atom needs an updated time on the feed; an empty blog still has a valid one, fixed so the file does not change between builds.
    // Why: the feed's own updated time is the most recent change of any post, so a rewrite of an older post moves it too.
    const latest = posts
      .map((post) => post.updated ?? post.date)
      .reduce<string | undefined>((newest, date) => (newest === undefined || date > newest ? date : newest), undefined);
    const updated = latest === undefined ? EMPTY_UPDATED : buildRfc3339(latest);
    const entries = posts.map((post) => AtomFeedUtil.buildEntry(post)).join("");
    return [
      '<?xml version="1.0" encoding="utf-8"?>',
      `<feed xmlns="${ATOM_NAMESPACE}">`,
      `<title>${escapeXml(SiteUtil.NAME)}</title>`,
      `<subtitle>${escapeXml(SiteUtil.DESCRIPTION)}</subtitle>`,
      `<id>${SiteUtil.buildUrl(HOME_PATH)}</id>`,
      `<link rel="self" href="${SiteUtil.buildUrl(FEED_PATH)}"/>`,
      `<link rel="alternate" href="${SiteUtil.buildUrl(BLOG_PATH)}"/>`,
      `<updated>${updated}</updated>`,
      `<author><name>${escapeXml(SiteUtil.NAME)}</name></author>`,
      entries,
      "</feed>",
    ].join("");
  }

  static buildEntry(post: Post): string {
    const url = SiteUtil.buildUrl(`/blog/${post.slug}/`);
    const published = buildRfc3339(post.date);
    const updated = buildRfc3339(post.updated ?? post.date);
    return [
      "<entry>",
      `<title>${escapeXml(post.title)}</title>`,
      `<link rel="alternate" href="${url}"/>`,
      `<id>${url}</id>`,
      `<published>${published}</published>`,
      `<updated>${updated}</updated>`,
      `<summary>${escapeXml(post.summary)}</summary>`,
      `<author><name>${escapeXml(SiteUtil.NAME)}</name></author>`,
      "</entry>",
    ].join("");
  }
}
