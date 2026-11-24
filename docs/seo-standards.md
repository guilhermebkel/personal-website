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
- **Open Graph and Twitter tags** (`og:title`, `og:description`, `og:url`, `og:type`, `twitter:card`). The `og:image` (1200×630 with alt) is not set yet; it belongs to the Open Graph images issue (#29). **(review)** until then.

## Pages by kind

- **Home:** one JSON-LD `Person` (name, URL, the LinkedIn and GitHub profiles). Enforced by `check:seo`; the content of the object is tested in `src/Utils/JsonLdUtil.test.ts`.
- **Post:** one JSON-LD `BlogPosting` with the headline, description, date, author and URL. Enforced by `check:seo`; the builder is tested in `src/Utils/JsonLdUtil.test.ts`.
- **Blog index:** no JSON-LD. **(review)**.

## Site files

- **`sitemap.xml`** lists the home, the blog index and every post once, with `lastmod` on the posts. Enforced by `check:seo` (sitemap against the built routes).
- **`robots.txt`** allows every crawler and names the sitemap. **(review)**.

## Content

- **A post has a summary.** Without it the build fails with a schema message. Enforced by `src/Services/PostService.test.ts`.
- **A post's summary is 70 to 175 characters**, because it is the description of the post page. Enforced by `check:seo` at build time.
