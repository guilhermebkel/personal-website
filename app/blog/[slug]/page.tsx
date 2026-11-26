import type { Metadata } from "next";
import Link from "next/link";
import { Cover } from "@components/Cover.tsx";
import { Icon } from "@components/Icon.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { PostCard } from "@components/PostCard.tsx";
import { PostContent } from "@components/PostContent.tsx";
import { PostInfo } from "@components/PostInfo.tsx";
import { JsonLd } from "@components/JsonLd.tsx";
import { JsonLdUtil } from "@/Utils/JsonLdUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";
import { PostSignature } from "@components/PostSignature.tsx";
import { PostSummaryBox } from "@components/PostSummaryBox.tsx";
import { PostSectionBar } from "@components/PostSectionBar.tsx";
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
  const path = `/blog/${slug}/`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: path, ...SiteUtil.FEED_ALTERNATES },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: SiteUtil.buildUrl(path),
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [SiteUtil.buildPostImageUrl(slug)],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [SiteUtil.buildPostImageUrl(slug)],
    },
  };
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
      <JsonLd data={JsonLdUtil.buildBlogPosting(post, `/blog/${slug}/`)} />
      <Reveal>
        <Link
          href="/blog/"
          className="inline-flex items-center gap-2 font-mono text-small text-text-soft no-underline hover:text-text"
        >
          <Icon name="left" />
          All posts
        </Link>
      </Reveal>
      {/* Why: the title is the largest element on a phone, so it is shown at once: an entrance that starts hidden moves its paint to after the first frame of the animation (Lighthouse LCP 3.3 s; 0.8 s without it). */}
      <div className="mt-9">
        <PostInfo
          date={post.date}
          updated={post.updated}
          readingMinutes={post.readingMinutes}
          title={post.title}
          tags={post.tags}
          headingLevel="h1"
          isLarge
        />
      </div>
      <div className="mt-10">
        <PostSummaryBox summary={post.summary} />
      </div>
      <Reveal delay={MotionUtil.getStaggerDelay(COVER_STEP)} className="mt-12">
        <Cover seed={slug} image={post.cover} className="h-105 rounded-lg border-2 border-sunken max-md:h-50" />
      </Reveal>
      <Reveal threshold={0} className="mt-16 flex items-start gap-24">
        <PostToc headings={HeadingSlugUtil.listH2(post.body)} />
        <div className="min-w-0 flex-1">
          <PostSectionBar headings={HeadingSlugUtil.listH2(post.body)} />
          <PostContent markdown={post.body} />
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
              <Reveal key={other.slug} as="li" delay={MotionUtil.getStaggerDelay(index)} className="min-w-0">
                <PostCard
                  href={`/blog/${other.slug}/`}
                  date={other.date}
                  readingMinutes={other.readingMinutes}
                  title={other.title}
                  summary={other.summary}
                  tags={other.tags}
                  cover={other.cover}
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
