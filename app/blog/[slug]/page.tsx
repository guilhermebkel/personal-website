import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContentFactory } from "@/Factories/ContentFactory.ts";

type PostPageProps = { params: Promise<{ slug: string }> };

// Why: the site is a static export, so a slug that no file backs must be a 404 and never a server render.
export const dynamicParams = false;

export const generateStaticParams = async () => {
  const posts = await ContentFactory.createPostService().listPosts();
  return posts.map((post) => ({ slug: post.slug }));
};

export const generateMetadata = async ({ params }: PostPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const post = await ContentFactory.createPostService().readPost(slug);
  return { title: post.title, description: post.summary };
};

const PostPage = async ({ params }: PostPageProps) => {
  const { slug } = await params;
  const post = await ContentFactory.createPostService().readPost(slug);
  return (
    <article className="mx-auto max-w-content px-4 py-8">
      <p className="font-mono text-caption text-text-muted">{`${post.date} · ${post.readingMinutes} min read`}</p>
      <h1>{post.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
    </article>
  );
};

export default PostPage;
