import type { Metadata } from "next";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { PostBrowser } from "@components/PostBrowser/index.tsx";
import { SectionTitle } from "@components/SectionTitle.tsx";
import { ContentFactory } from "@/Factories/ContentFactory.ts";

export const metadata: Metadata = { title: "Posts" };

const BlogPage = async () => {
  const posts = await ContentFactory.createPostService().listPosts();
  return (
    <div className={`pt-16 pb-28 ${PAGE_X}`}>
      <SectionTitle isPageTitle eyebrow="Posts" title="Notes on what I build, break and rebuild." />
      <PostBrowser posts={posts} />
    </div>
  );
};

export default BlogPage;
