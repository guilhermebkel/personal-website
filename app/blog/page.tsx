import type { Metadata } from "next";
import Link from "next/link";
import { ContentFactory } from "@/Factories/ContentFactory.ts";

export const metadata: Metadata = { title: "Posts" };

const BlogPage = async () => {
  const posts = await ContentFactory.createPostService().listPosts();
  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1>Notes on what I build, break and rebuild.</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
            <span className="font-mono text-caption text-text-muted">{` ${post.date} · ${post.readingMinutes} min`}</span>
            <p>{post.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogPage;
