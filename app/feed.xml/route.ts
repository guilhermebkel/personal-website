import { ContentFactory } from "@/Factories/ContentFactory.ts";
import { AtomFeedUtil } from "@/Utils/AtomFeedUtil.ts";

// Why: the feed is written once at build time as out/feed.xml, like every other page of the static site.
export const dynamic = "force-static";

export const GET = async () => {
  const posts = await ContentFactory.createPostService().listPosts();
  return new Response(AtomFeedUtil.buildFeed(posts), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
};
