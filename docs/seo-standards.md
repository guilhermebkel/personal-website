# SEO standards

What every page of the site has, and what enforces it. The rules are checked on the built HTML in `out/` by `pnpm check:seo` (`scripts/check-seo.mjs`), which runs in `pnpm check` after the build. A rule marked **(review)** has no test; a person checks it when the page changes.

The 404 page (`/404/`, `/_not-found/`, `404.html`) is exempt from the canonical, the description and the sitemap. It is `noindex`.

## Every page

- **One `h1`.** Enforced by `check:seo`.
- **One `title`, 10 to 65 characters.** The layout adds ` · Guilherme Mota` to child pages, so a long post title can break this rule; shorten the title, not the rule. Enforced by `check:seo`.
- **One `meta description`, 70 to 175 characters.** Enforced by `check:seo`.
- **One canonical link, absolute, `https://guilherr.me/…`, equal to `og:url`.** Enforced by `check:seo`. The address is `SiteUtil.URL` (`src/Utils/SiteUtil.ts`).
- **`<html lang>` is set.** Enforced by `check:seo`.
- **No `noindex`** except on the 404 page. Enforced by `check:seo`.
- **Open Graph and Twitter tags** (`og:title`, `og:description`, `og:url`, `og:type`, `twitter:card`). Enforced by `check:seo`; the card is `summary_large_image`.
- **A share image on the home and on every post.** `og:image` is an absolute URL on the site, and its file in `out/` is a PNG of 1200×630. Enforced by `check:seo`. The image is drawn at build time by `app/opengraph-image.tsx` and `app/blog/[slug]/opengraph-image.tsx` with `next/og`, from the tokens (`src/Utils/ColorTokenUtil.ts`) and the Ubuntu font. The card's layout is tested by eye: a title of 148 characters wraps inside the frame (checked once with a temporary post, removed).
- **A feed link on every page** (`<link rel="alternate" type="application/atom+xml">` to `/feed.xml`). Enforced by `check:seo`. Each page repeats it in its metadata (`SiteUtil.FEED_ALTERNATES`), because Next replaces the `alternates` object of a page.

## Pages by kind

- **Home:** one JSON-LD `Person` with `@id` `https://guilherr.me/#person`, the name, URL and the LinkedIn and GitHub profiles. Enforced by `check:seo` (the `@id`); the content is tested in `src/Utils/JsonLdUtil.test.ts`.
- **Post:** one JSON-LD `BlogPosting` with the headline, description, `image`, `datePublished`, `dateModified`, `keywords` (only when the post has tags), `inLanguage` (`en`), the author and the URL. The `image` is the page's `og:image`. The author has the same `@id` as the home's `Person`, so the two are one owner for a crawler. Enforced by `check:seo` (valid JSON, the image, the author's `@id`); the builder is tested in `src/Utils/JsonLdUtil.test.ts`.
- **Dates of a post:** `date` is the publication date; `updated` (optional, set only when the content changed) is the last change. A post with `updated` shows `Updated <date>` on its page, uses it as `dateModified`, as the feed entry's `updated` and as the sitemap `lastmod`. `updated` earlier than `date` fails the build (`src/Schemas/PostSchema.ts`).
- **Blog index:** no JSON-LD. **(review)**.

## AI search

Search for AI features (Google's AI Overviews and AI Mode, ChatGPT search, Perplexity and the others) is still search: the same pages, indexed by the same crawlers. Google's guide on AI features (Search Central, updated 2026-07-10) says no special file or markup is needed, and that content written for AI or produced at scale is spam. The rules here follow that; a change that adds a file or a markup "for AI" needs a row in the table below with its tag and a source before it lands.

**Crawlers.** The site allows every crawler, search and training alike, on purpose (decided 2026-11-25). `app/robots.txt/route.ts` lists each one below in its own group, and `check:seo` fails if any is disallowed. Blocking a training crawler does not remove a page from its search product, so the two are separate decisions.

| Agent             | Company      | Used for                                                | Allowed |
| ----------------- | ------------ | ------------------------------------------------------- | ------- |
| Googlebot         | Google       | Search                                                  | yes     |
| Google-Extended   | Google       | Gemini training; does not affect Search or AI Overviews | yes     |
| Bingbot           | Microsoft    | Search                                                  | yes     |
| OAI-SearchBot     | OpenAI       | ChatGPT search                                          | yes     |
| ChatGPT-User      | OpenAI       | Fetches requested by a user in ChatGPT                  | yes     |
| GPTBot            | OpenAI       | Training                                                | yes     |
| Claude-SearchBot  | Anthropic    | Search                                                  | yes     |
| Claude-User       | Anthropic    | Fetches requested by a user in Claude                   | yes     |
| ClaudeBot         | Anthropic    | Training                                                | yes     |
| PerplexityBot     | Perplexity   | Search                                                  | yes     |
| Perplexity-User   | Perplexity   | Fetches requested by a user in Perplexity               | yes     |
| Applebot          | Apple        | Search (Siri, Spotlight)                                | yes     |
| Applebot-Extended | Apple        | Control of training use                                 | yes     |
| CCBot             | Common Crawl | Public dataset                                          | yes     |

**Practices.** Each one is tagged. **Base** is what a page needs to be read at all. **Likely gain** is what the evidence supports, without a measurement on this site. **Hygiene** is harmless, has no measured gain, and is not used.

- Static HTML text that a crawler reads without running JavaScript. **Base**.
- A dated update visible on the page, and `dateModified` in the JSON-LD, when the content changed. **Base**.
- A direct answer at the top of a post (the summary box). **Likely gain**.
- Facts with their units, dates and sources. **Likely gain**.
- `llms.txt`. **Hygiene**, not used: no measured gain.
- FAQ markup and question-shaped headings. **Hygiene**, not used.

**Do not.** Write text only for AI, or a second version of a page for a crawler. Stuff keywords or repeat them to match questions. Make a page for each keyword variation. Produce posts at scale. Tune a page for an AI answer by a claim the page cannot support.

**Measure** with the generative AI report in Search Console and the AI report in Bing Webmaster Tools. Do not measure by the referral clicks of an AI product: they are a small part of the traffic and a poor signal of being cited.

**Sources.**

- Google, "AI features and your website", Search Central, updated 2026-07-10: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- OpenAI, "Overview of OpenAI crawlers": https://platform.openai.com/docs/bots
- Google, "Google's crawlers and fetchers": https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
- Anthropic, "Does Anthropic crawl data from the web, and how can site owners block the crawler?": https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Aggarwal et al., "GEO: Generative Engine Optimization", KDD 2024 (Princeton). The paper measures which content changes raise the visibility of a source in generative answers; this site uses only the ones listed as Likely gain.

## Site files

- **`feed.xml`** is an Atom feed of every post, newest first, with title, link, id, published and updated times (`updated` is the update when the post has one, and the feed's own time is the latest of all posts), and summary. Text is escaped (`&`, `<`, `>`, quotes). Enforced by `check:seo` (each post once, newest first, escaping) and by `src/Utils/AtomFeedUtil.test.ts`. It is written by `app/feed.xml/route.ts` at build time.
- **`sitemap.xml`** lists the home, the blog index and every post once, with `lastmod` on the posts (the `updated` date when the post has one). Enforced by `check:seo` (sitemap against the built routes).
- **`robots.txt`** (`app/robots.txt/route.ts`) allows every crawler, has a group for each agent of the "AI search" table, and names the sitemap. Enforced by `check:seo`: a `Disallow` with a path for `*` or for a listed agent fails the build, and so does a missing sitemap line. An empty `Disallow:` is allowed.
- **Folder names with a dot are not used for routes.** Next did not generate the share image of a post when its folder was named `opengraph-image.png`; the file convention `opengraph-image` (no extension) works.

## Content

- **A post has a summary.** Without it the build fails with a schema message. Enforced by `src/Services/PostService.test.ts`.
- **A post's summary is 70 to 175 characters**, because it is the description of the post page. Enforced by `check:seo` at build time.
