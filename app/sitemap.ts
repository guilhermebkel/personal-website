import type { MetadataRoute } from "next";
import { ContentFactory } from "@/Factories/ContentFactory.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

export const dynamic = "force-static";

const readSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const posts = await ContentFactory.createPostService().listPosts();
  const postEntries = posts.map((post) => ({
    url: SiteUtil.buildUrl(`/blog/${post.slug}/`),
    lastModified: post.updated ?? post.date,
  }));
  return [{ url: SiteUtil.buildUrl("/") }, { url: SiteUtil.buildUrl("/blog/") }, ...postEntries];
};

export default readSitemap;
