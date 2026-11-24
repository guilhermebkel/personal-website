import type { Metadata } from "next";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { PostBrowser } from "@components/PostBrowser/index.tsx";
import { SectionTitle } from "@components/SectionTitle.tsx";
import { ContentFactory } from "@/Factories/ContentFactory.ts";

export const metadata: Metadata = {
  title: "Posts",
  description: "Notes on what I build, break and rebuild: every post I have written, newest first.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    title: "Posts",
    description: "Notes on what I build, break and rebuild: every post I have written, newest first.",
    url: "https://guilherr.me/blog/",
    type: "website",
  },
  twitter: { card: "summary", title: "Posts" },
};

const BlogPage = async () => {
  const posts = await ContentFactory.createPostService().listPosts();
  return (
    <div className={`pt-16 pb-28 ${PAGE_X}`}>
      <SectionTitle
        headingId="blog-title"
        isPageTitle
        eyebrow="Posts"
        title="Notes on what I build, break and rebuild."
      />
      <PostBrowser posts={posts} />
    </div>
  );
};

export default BlogPage;
