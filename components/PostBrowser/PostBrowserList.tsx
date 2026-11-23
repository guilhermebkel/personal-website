"use client";

import { PostCard } from "@components/PostCard.tsx";
import { usePostBrowserState } from "@components/PostBrowser/PostBrowserContext.ts";
import { PostRow } from "@components/PostRow.tsx";
import { Reveal } from "@components/Reveal.tsx";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

export const PostBrowserList = () => {
  const { view, visible } = usePostBrowserState();
  if (view === "grid") {
    return (
      <ul className="m-0 mt-12 grid list-none grid-cols-1 gap-x-8 gap-y-14 p-0 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((post, index) => (
          <Reveal key={post.slug} as="li" delay={MotionUtil.getStaggerDelay(index)} className="min-w-0">
            <PostCard
              href={`/blog/${post.slug}/`}
              date={post.date}
              readingMinutes={post.readingMinutes}
              title={post.title}
              summary={post.summary}
              tags={post.tags}
            />
          </Reveal>
        ))}
      </ul>
    );
  }
  return (
    <ul className="m-0 mt-12 flex list-none flex-col border-t-2 border-sunken p-0">
      {visible.map((post, index) => (
        <Reveal key={post.slug} as="li" delay={MotionUtil.getStaggerDelay(index)}>
          <PostRow
            href={`/blog/${post.slug}/`}
            date={post.date}
            readingMinutes={post.readingMinutes}
            title={post.title}
            summary={post.summary}
          />
        </Reveal>
      ))}
    </ul>
  );
};
