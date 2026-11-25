import { SiteUtil } from "@/Utils/SiteUtil.ts";

// Why: the site is static, so the file is written once at build time as out/robots.txt, like the feed and the sitemap.
export const dynamic = "force-static";

// Why: search crawlers and AI training crawlers are allowed on purpose (decided 2026-11-25, #78). Blocking a training crawler does not remove a page from its search product, so the two are not traded against each other. docs/seo-standards.md ("AI search") has the table. scripts/check-seo.mjs fails the build if any of these agents is disallowed, so the decision cannot be undone by accident.
const ALLOWED_AGENTS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
];

const buildRobots = () => {
  const groups = ["*", ...ALLOWED_AGENTS].map((agent) => `User-agent: ${agent}\nAllow: /`);
  return [
    "# Search and AI training crawlers are allowed on purpose (decided 2026-11-25). See docs/seo-standards.md, AI search.",
    "",
    ...groups.flatMap((group) => [group, ""]),
    `Sitemap: ${SiteUtil.buildUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
};

export const GET = () =>
  new Response(buildRobots(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
