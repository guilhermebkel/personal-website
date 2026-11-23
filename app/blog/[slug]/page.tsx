import type { Metadata } from "next";
import Link from "next/link";
import { Cover } from "@components/Cover.tsx";
import { Icon } from "@components/Icon.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { PostCard } from "@components/PostCard.tsx";
import { PostContent } from "@components/PostContent.tsx";
import { PostInfo } from "@components/PostInfo.tsx";
import { PostSignature } from "@components/PostSignature.tsx";
import { PostSummaryBox } from "@components/PostSummaryBox.tsx";
import { PostToc } from "@components/PostToc.tsx";
import { Reveal } from "@components/Reveal.tsx";
import { ContentFactory } from "@/Factories/ContentFactory.ts";
import { HeadingSlugUtil } from "@/Utils/HeadingSlugUtil.ts";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

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

const MORE_POSTS = 2;
const COVER_STEP = 2;

const PostPage = async ({ params }: PostPageProps) => {
  const { slug } = await params;
  const service = ContentFactory.createPostService();
  const post = await service.readPost(slug);
  const others = (await service.listPosts()).filter((other) => other.slug !== slug).slice(0, MORE_POSTS);
  return (
    <article className={`pt-12 pb-24 ${PAGE_X}`}>
      <Reveal>
        <Link
          href="/blog/"
          className="inline-flex items-center gap-2 font-mono text-small text-text-soft no-underline hover:text-text"
        >
          <Icon name="left" />
          All posts
        </Link>
      </Reveal>
      <Reveal delay={MotionUtil.delayFor(1)} className="mt-9">
        <PostInfo
          date={post.date}
          readingMinutes={post.readingMinutes}
          title={post.title}
          tags={post.tags}
          headingLevel="h1"
          isLarge
        />
      </Reveal>
      <Reveal delay={MotionUtil.delayFor(COVER_STEP)} className="mt-12">
        <Cover className="h-105 rounded-lg max-md:h-50" />
      </Reveal>
      <Reveal className="mt-16 flex items-start gap-24">
        <PostToc headings={HeadingSlugUtil.listH2(post.body)} />
        <div className="min-w-0">
          <PostContent markdown={post.body} />
          <PostSummaryBox summary={post.summary} />
        </div>
      </Reveal>
      <div className="mt-20">
        <PostSignature />
      </div>
      {others.length > 0 && (
        <section aria-label="Keep reading" className="mt-20">
          <Reveal>
            <p className="m-0 font-mono text-small tracking-wide text-purple-light">Keep reading</p>
          </Reveal>
          <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-x-8 gap-y-14 p-0 md:grid-cols-2">
            {others.map((other, index) => (
              <Reveal key={other.slug} as="li" delay={MotionUtil.delayFor(index)} className="min-w-0">
                <PostCard
                  href={`/blog/${other.slug}/`}
                  date={other.date}
                  readingMinutes={other.readingMinutes}
                  title={other.title}
                  summary={other.summary}
                  tags={other.tags}
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

export default PostPage;
