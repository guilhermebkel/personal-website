import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const SITE = "https://guilherr.me";
const TITLE_MIN = 10;
const TITLE_MAX = 65;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 175;
const ONE = 1;
const FIRST_MATCH = 1;
const NOT_FOUND_FILE = "404.html";
const INDEX_FILE = "index.html";
const SITEMAP_FILE = "sitemap.xml";
const HOME = "/";
const BLOG_INDEX = "/blog/";
const POST_PREFIX = "/blog/";
// Why: Next writes the not-found page under two routes; both are noindex and outside the sitemap.
const NOT_FOUND_ROUTES = [NOT_FOUND_FILE, "/404/", "/_not-found/"];

const TITLE_PATTERN = /<title>([^<]*)<\/title>/gu;
const DESCRIPTION_PATTERN = /<meta name="description" content="([^"]*)"/gu;
const CANONICAL_PATTERN = /<link rel="canonical" href="([^"]*)"/gu;
const OG_URL_PATTERN = /<meta property="og:url" content="([^"]*)"/gu;
const H1_PATTERN = /<h1[\s>]/gu;
const LANG_PATTERN = /<html[^>]*\blang="[^"]+"/u;
const NOINDEX_PATTERN = /<meta name="robots" content="[^"]*noindex/u;
const JSON_LD_PATTERN = /<script type="application\/ld\+json">/gu;
const LOC_PATTERN = /<loc>([^<]*)<\/loc>/gu;
const OG_IMAGE_PATTERN = /<meta property="og:image" content="([^"]*)"/gu;
const FEED_LINK_PATTERN = /<link rel="alternate" type="application\/atom\+xml" href="([^"]*)"/gu;
const ENTRY_PATTERN = /<entry>([\s\S]*?)<\/entry>/gu;
const ENTRY_ID_PATTERN = /<id>([^<]*)<\/id>/u;
const ENTRY_PUBLISHED_PATTERN = /<published>([^<]*)<\/published>/u;
const UNESCAPED_AMPERSAND_PATTERN = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/u;
const ATOM_NAMESPACE_TAG = '<feed xmlns="http://www.w3.org/2005/Atom"';
const FEED_URL = `${SITE}/feed.xml`;
const FEED_FILE = "feed.xml";
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;
const PNG_SIGNATURE = "89504e470d0a1a0a";
const PNG_SIGNATURE_BYTES = 8;
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const QUERY_SEPARATOR = "?";

const listHtml = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      return listHtml(path);
    }
    return name.endsWith(".html") ? [path] : [];
  });

const matchAll = (pattern, html) => [...html.matchAll(pattern)].map((match) => match[FIRST_MATCH]);

const isPostRoute = (route) => route.startsWith(POST_PREFIX) && route !== BLOG_INDEX;

const hasShareImage = (route) => route === HOME || isPostRoute(route);

export const readPngSize = (buffer) => {
  // Why: a share image is a PNG; its size is read from the IHDR chunk so a wrong file fails the check, not a social card.
  if (buffer.subarray(0, PNG_SIGNATURE_BYTES).toString("hex") !== PNG_SIGNATURE) {
    return null;
  }
  return { width: buffer.readUInt32BE(PNG_WIDTH_OFFSET), height: buffer.readUInt32BE(PNG_HEIGHT_OFFSET) };
};

const resolveFolder = (path) => (path.endsWith(INDEX_FILE) ? path.slice(0, -INDEX_FILE.length) : path);

export const buildRoute = (file) => {
  const relativePath = relative(OUT, file).split(sep).join("/");
  // Why: the not-found file keeps its name; every other page is the folder it sits in.
  if (relativePath === NOT_FOUND_FILE) {
    return relativePath;
  }
  return `/${resolveFolder(relativePath)}`;
};

const checkTitle = (html) => {
  const titles = matchAll(TITLE_PATTERN, html);
  if (titles.length !== ONE) {
    return [`title: ${titles.length} found, expected one`];
  }
  const { length } = titles[0];
  if (length < TITLE_MIN || length > TITLE_MAX) {
    return [`title: ${length} characters, expected ${TITLE_MIN}-${TITLE_MAX}`];
  }
  return [];
};

const checkHead = (html) => {
  const problems = checkTitle(html);
  if (!LANG_PATTERN.test(html)) {
    problems.push("html lang: missing");
  }
  if (matchAll(H1_PATTERN, html).length !== ONE) {
    problems.push("h1: must be exactly one");
  }
  return problems;
};

const checkDescription = (html) => {
  const descriptions = matchAll(DESCRIPTION_PATTERN, html);
  if (descriptions.length !== ONE) {
    return [`description: ${descriptions.length} found, expected one`];
  }
  const { length } = descriptions[0];
  if (length < DESCRIPTION_MIN || length > DESCRIPTION_MAX) {
    return [`description: ${length} characters, expected ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}`];
  }
  return [];
};

const checkCanonical = (html) => {
  const canonicals = matchAll(CANONICAL_PATTERN, html);
  const ogUrls = matchAll(OG_URL_PATTERN, html);
  if (canonicals.length !== ONE || !canonicals[0].startsWith(`${SITE}/`)) {
    return ["canonical: must be one absolute https URL on the site"];
  }
  if (ogUrls[0] !== canonicals[0]) {
    return ["og:url: must equal the canonical URL"];
  }
  return [];
};

const checkJsonLd = (route, html) => {
  const isPost = isPostRoute(route);
  const problems = [];
  if (route === HOME && !html.includes('"@type":"Person"')) {
    problems.push("json-ld: the home needs a Person");
  }
  if (isPost && !html.includes('"@type":"BlogPosting"')) {
    problems.push("json-ld: a post needs a BlogPosting");
  }
  const scripts = matchAll(JSON_LD_PATTERN, html);
  if (scripts.length === 0 && (route === HOME || isPost)) {
    problems.push("json-ld: no script of type application/ld+json");
  }
  return problems;
};

const checkShareImage = (route, html) => {
  if (!hasShareImage(route)) {
    return [];
  }
  const images = matchAll(OG_IMAGE_PATTERN, html);
  if (images.length !== ONE) {
    return [`og:image: ${images.length} found, expected one`];
  }
  if (!images[0].startsWith(`${SITE}/`)) {
    return ["og:image: must be an absolute https URL on the site"];
  }
  return [];
};

const checkFeedLink = (html) => {
  const links = matchAll(FEED_LINK_PATTERN, html);
  return links.length === ONE && links[0] === FEED_URL ? [] : ["feed: the page must link the Atom feed once"];
};

export const checkPage = (route, html) => {
  // Why: each rule returns its own message, so the report says what to fix on which page.
  const problems = checkHead(html);
  if (NOT_FOUND_ROUTES.includes(route)) {
    return problems;
  }
  problems.push(
    ...checkDescription(html),
    ...checkCanonical(html),
    ...checkJsonLd(route, html),
    ...checkShareImage(route, html),
    ...checkFeedLink(html),
  );
  if (NOINDEX_PATTERN.test(html)) {
    problems.push("robots: noindex is not allowed on this page");
  }
  return problems;
};

export const checkSitemap = (sitemapXml, routes) => {
  // Why: the sitemap lists every page once, so a crawler finds each post without following links.
  const locations = matchAll(LOC_PATTERN, sitemapXml);
  const expected = routes.filter((route) => !NOT_FOUND_ROUTES.includes(route)).map((route) => `${SITE}${route}`);
  const unique = new Set(locations);
  const problems = [];
  if (unique.size !== locations.length) {
    problems.push("sitemap: a page is listed more than once");
  }
  for (const url of expected) {
    if (!unique.has(url)) {
      problems.push(`sitemap: ${url} is missing`);
    }
  }
  for (const url of unique) {
    if (!expected.includes(url)) {
      problems.push(`sitemap: ${url} is not a page of the site`);
    }
  }
  return problems;
};

export const checkFeed = (feedXml, postRoutes) => {
  // Why: a feed entry is one post; the check compares the entries with the post pages, so a post missing from the feed fails the build.
  if (!feedXml.includes(ATOM_NAMESPACE_TAG)) {
    return ["feed: must be an Atom feed"];
  }
  const problems = [];
  if (UNESCAPED_AMPERSAND_PATTERN.test(feedXml)) {
    problems.push("feed: an & in the text is not escaped");
  }
  const entries = matchAll(ENTRY_PATTERN, feedXml);
  const ids = entries.map((entry) => entry.match(ENTRY_ID_PATTERN)?.[FIRST_MATCH]);
  const expected = postRoutes.map((route) => `${SITE}${route}`);
  if (ids.length !== expected.length || expected.some((url) => !ids.includes(url))) {
    problems.push(`feed: must list each of the ${expected.length} posts once`);
  }
  const published = entries.map((entry) => entry.match(ENTRY_PUBLISHED_PATTERN)?.[FIRST_MATCH] ?? "");
  const newestFirst = published.every((date, index) => index === 0 || published[index - ONE] >= date);
  if (!newestFirst) {
    problems.push("feed: entries must be newest first");
  }
  return problems;
};

const checkShareImageFile = (route, html) => {
  if (!hasShareImage(route)) {
    return [];
  }
  const [url] = matchAll(OG_IMAGE_PATTERN, html);
  if (url === undefined) {
    return [];
  }
  const file = join(OUT, url.slice(SITE.length).split(QUERY_SEPARATOR)[0]);
  if (!existsSync(file)) {
    return [`og:image: ${url} has no file in out/`];
  }
  const size = readPngSize(readFileSync(file));
  if (size === null || size.width !== SHARE_IMAGE_WIDTH || size.height !== SHARE_IMAGE_HEIGHT) {
    return [`og:image: ${url} is not a ${SHARE_IMAGE_WIDTH}x${SHARE_IMAGE_HEIGHT} PNG`];
  }
  return [];
};

export const checkSite = () => {
  const files = listHtml(OUT);
  const routes = files.map(buildRoute);
  const pageProblems = files.flatMap((file, index) => {
    const html = readFileSync(file, "utf8");
    const problems = [...checkPage(routes[index], html), ...checkShareImageFile(routes[index], html)];
    return problems.map((problem) => `${routes[index]}: ${problem}`);
  });
  const sitemapXml = readFileSync(join(OUT, SITEMAP_FILE), "utf8");
  const postRoutes = routes.filter(isPostRoute);
  const feedPath = join(OUT, FEED_FILE);
  const feedXml = readFileSync(feedPath, "utf8");
  const feedProblems = checkFeed(feedXml, postRoutes).map((problem) => `${FEED_FILE}: ${problem}`);
  return [...pageProblems, ...checkSitemap(sitemapXml, routes), ...feedProblems];
};

const isMain = () =>
  process.argv[FIRST_MATCH] !== undefined && import.meta.url === pathToFileURL(process.argv[FIRST_MATCH]).href;

if (isMain()) {
  const problems = checkSite();
  if (problems.length > 0) {
    process.stdout.write(`${problems.join("\n")}\n`);
    process.exitCode = ONE;
  } else {
    process.stdout.write("check-seo: every page passes docs/seo-standards.md.\n");
  }
}
