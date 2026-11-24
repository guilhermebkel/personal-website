import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const REFERENCE = /\s(?:href|src)="([^"]*)"/gu;
const ID = /\sid="([^"]*)"/gu;
// Why: a scheme (https:, mailto:) or a protocol-relative URL leaves the site; a static check cannot follow it, so it is listed, never fetched.
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu;
const INDEX_FILE = "index.html";
const HTML_SUFFIX = ".html";
const SITE_ORIGIN = "http://site";

export const collectReferences = (html) => [...html.matchAll(REFERENCE)].map((match) => match[1]);

export const collectIds = (html) => new Set([...html.matchAll(ID)].map((match) => match[1]));

export const resolveReference = (reference, fromPage) => {
  // Why: a query string (?v=...) names the same file, so it is dropped before a path is compared.
  if (EXTERNAL.test(reference)) {
    return { external: true };
  }
  const [withoutFragment, fragment = ""] = reference.split("#");
  const [path] = withoutFragment.split("?");
  if (path === "") {
    return { external: false, target: fromPage, fragment };
  }
  const resolved = new URL(path, `${SITE_ORIGIN}${fromPage}`);
  return { external: false, target: resolved.pathname, fragment };
};

const hasBuiltFile = (target, files) => files.has(target) || files.has(target.endsWith("/") ? target : `${target}/`);

const findBrokenReference = ({ fromPage, reference, routeToHtml, files }) => {
  const resolved = resolveReference(reference, fromPage);
  if (resolved.external) {
    return undefined;
  }
  if (!hasBuiltFile(resolved.target, files)) {
    return `${fromPage} -> ${reference}`;
  }
  const targetHtml = routeToHtml.get(resolved.target);
  const hasFragment =
    resolved.fragment === "" || targetHtml === undefined || collectIds(targetHtml).has(resolved.fragment);
  return hasFragment ? undefined : `${fromPage} -> ${reference} (no id "${resolved.fragment}")`;
};

export const findBrokenReferences = ({ routeToHtml, files }) => {
  // Why: pages are checked by their route ("/blog/"), files by their own path; a fragment must name an id on the page it points to.
  return [...routeToHtml].flatMap(([fromPage, html]) =>
    collectReferences(html)
      .map((reference) => findBrokenReference({ fromPage, reference, routeToHtml, files }))
      .filter((broken) => broken !== undefined),
  );
};

const listFiles = (folder) => {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
};

export const readBuiltSite = (root) => {
  // Why: every page of out/ is a route (its folder with a trailing slash); every file is also a path a link can name.
  const files = new Set();
  const routeToHtml = new Map();
  for (const file of listFiles(root)) {
    const urlPath = `/${relative(root, file).split(sep).join("/")}`;
    files.add(urlPath);
    if (urlPath.endsWith(`/${INDEX_FILE}`)) {
      const route = urlPath.slice(0, -INDEX_FILE.length);
      routeToHtml.set(route, readFileSync(file, "utf8"));
      files.add(route);
    }
    if (urlPath.endsWith(HTML_SUFFIX) && !urlPath.endsWith(`/${INDEX_FILE}`)) {
      routeToHtml.set(urlPath, readFileSync(file, "utf8"));
    }
  }
  return { routeToHtml, files };
};

const isMain = () => {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
};

if (isMain()) {
  const outFolder = join(process.cwd(), "out");
  const site = readBuiltSite(outFolder);
  if (site.routeToHtml.size === 0) {
    process.stderr.write("check-links: out/ has no pages: run pnpm build first.\n");
    process.exit(1);
  }
  const broken = findBrokenReferences(site);
  for (const line of broken) {
    process.stderr.write(`broken link: ${line}\n`);
  }
  if (broken.length > 0) {
    process.exit(1);
  }
  process.stdout.write(`check-links: ${site.routeToHtml.size} pages, every internal link resolves.\n`);
}
