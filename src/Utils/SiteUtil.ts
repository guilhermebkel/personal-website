export class SiteUtil {
  // Why: one address for the site, used by the metadata, the sitemap and the structured data, so the canonical URLs cannot disagree.
  static readonly URL = "https://guilherr.me";
  static readonly NAME = "Guilherme Mota";
  static readonly DESCRIPTION =
    "Guilherme Mota is a problem solver passionate about cloud computing and complex systems. Notes on what I build, break and rebuild.";

  static buildUrl(path: string): string {
    return `${SiteUtil.URL}${path}`;
  }

  static buildPostImageUrl(slug: string): string {
    // Why: the share image of a post is one address, used by the page's og:image and by its structured data, so the two cannot disagree.
    return SiteUtil.buildUrl(`/blog/${slug}/opengraph-image`);
  }

  // Why: Next replaces the whole alternates object of a page, so every page repeats the feed link instead of inheriting it from the layout.
  static readonly FEED_ALTERNATES = { types: { "application/atom+xml": SiteUtil.buildUrl("/feed.xml") } };
}
