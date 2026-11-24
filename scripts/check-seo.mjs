import { readFileSync, readdirSync, statSync } from "node:fs";
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

const listHtml = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      return listHtml(path);
    }
    return name.endsWith(".html") ? [path] : [];
  });

const matchAll = (pattern, html) => [...html.matchAll(pattern)].map((match) => match[FIRST_MATCH]);

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
  const isPost = route.startsWith(POST_PREFIX) && route !== BLOG_INDEX;
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

export const checkPage = (route, html) => {
  // Why: each rule returns its own message, so the report says what to fix on which page.
  const problems = checkHead(html);
  if (NOT_FOUND_ROUTES.includes(route)) {
    return problems;
  }
  problems.push(...checkDescription(html), ...checkCanonical(html), ...checkJsonLd(route, html));
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

export const checkSite = () => {
  const files = listHtml(OUT);
  const routes = files.map(buildRoute);
  const pageProblems = files.flatMap((file, index) => {
    const html = readFileSync(file, "utf8");
    return checkPage(routes[index], html).map((problem) => `${routes[index]}: ${problem}`);
  });
  const sitemapXml = readFileSync(join(OUT, SITEMAP_FILE), "utf8");
  return [...pageProblems, ...checkSitemap(sitemapXml, routes)];
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
