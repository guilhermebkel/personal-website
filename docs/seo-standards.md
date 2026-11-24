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

- **Home:** one JSON-LD `Person` (name, URL, the LinkedIn and GitHub profiles). Enforced by `check:seo`; the content of the object is tested in `src/Utils/JsonLdUtil.test.ts`.
- **Post:** one JSON-LD `BlogPosting` with the headline, description, date, author and URL. Enforced by `check:seo`; the builder is tested in `src/Utils/JsonLdUtil.test.ts`.
- **Blog index:** no JSON-LD. **(review)**.

## Site files

- **`feed.xml`** is an Atom feed of every post, newest first, with title, link, id, published and updated times, and summary. Text is escaped (`&`, `<`, `>`, quotes). Enforced by `check:seo` (each post once, newest first, escaping) and by `src/Utils/AtomFeedUtil.test.ts`. It is written by `app/feed.xml/route.ts` at build time.
- **`sitemap.xml`** lists the home, the blog index and every post once, with `lastmod` on the posts. Enforced by `check:seo` (sitemap against the built routes).
- **`robots.txt`** allows every crawler and names the sitemap. **(review)**.
- **Folder names with a dot are not used for routes.** Next did not generate the share image of a post when its folder was named `opengraph-image.png`; the file convention `opengraph-image` (no extension) works.

## Content

- **A post has a summary.** Without it the build fails with a schema message. Enforced by `src/Services/PostService.test.ts`.
- **A post's summary is 70 to 175 characters**, because it is the description of the post page. Enforced by `check:seo` at build time.
