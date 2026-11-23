"use client";

import { useState } from "react";
import { Button } from "@components/Button.tsx";
import { Icon, type IconName } from "@components/Icon.tsx";
import { PostCard } from "@components/PostCard.tsx";
import { PostRow } from "@components/PostRow.tsx";
import { Reveal } from "@components/Reveal.tsx";
import type { Post } from "@/Protocols/PostProtocol.ts";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

type PostBrowserProps = { posts: Post[] };

type Order = "recent" | "oldest";
type View = "grid" | "list";

type ViewOption = {
  view: View;
  icon: IconName;
  label: string;
};

const PAGE_SIZE = 6;

const VIEW_OPTIONS: ViewOption[] = [
  { view: "grid", icon: "grid", label: "Show as a grid" },
  { view: "list", icon: "list", label: "Show as a list" },
];

const sortPosts = (posts: Post[], order: Order) => {
  const sorted = [...posts].sort((first, second) => second.date.localeCompare(first.date));
  return order === "recent" ? sorted : sorted.reverse();
};

export const PostBrowser = ({ posts }: PostBrowserProps) => {
  const [order, setOrder] = useState<Order>("recent");
  const [view, setView] = useState<View>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = sortPosts(posts, order).slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div>
      <div className="mt-12 flex items-center justify-between gap-4">
        <label className="relative inline-flex items-center">
          <span className="sr-only">Order of the posts</span>
          <select
            value={order}
            onChange={(event) => {
              setOrder(event.target.value === "oldest" ? "oldest" : "recent");
            }}
            className={[
              "h-11 cursor-pointer appearance-none font-sans rounded-pill border-2 border-border-strong bg-control py-0 pr-11 pl-5",
              "text-body text-text transition-colors duration-250 md:hover:border-purple-light",
            ].join(" ")}
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
          </select>
          <Icon name="chevron" className="pointer-events-none absolute right-4 size-4 text-text-soft" />
        </label>
        <div role="group" aria-label="View" className="inline-flex gap-1 rounded-pill border-2 border-border-strong bg-control p-0.75 max-md:hidden">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.view}
              type="button"
              aria-label={option.label}
              aria-pressed={view === option.view}
              onClick={() => {
                setView(option.view);
              }}
              className={[
                "inline-flex h-8.5 w-9.5 cursor-pointer items-center justify-center rounded-pill border-0 bg-transparent p-0 text-text-muted",
                "transition-colors duration-250 aria-pressed:bg-purple aria-pressed:text-text",
              ].join(" ")}
            >
              <Icon name={option.icon} className="size-4.5" />
            </button>
          ))}
        </div>
      </div>
      {view === "grid"
        ? (
            <ul className="m-0 mt-12 grid list-none grid-cols-1 gap-x-8 gap-y-14 p-0 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((post, index) => (
                <Reveal key={post.slug} as="li" delay={MotionUtil.delayFor(index)} className="min-w-0">
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
          )
        : (
            <ul className="m-0 mt-12 flex list-none flex-col border-t-2 border-sunken p-0">
              {visible.map((post, index) => (
                <Reveal key={post.slug} as="li" delay={MotionUtil.delayFor(index)}>
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
          )}
      {hasMore && (
        <div className="mt-16 flex justify-center">
          <Button
            variant="primary"
            className="h-12"
            onClick={() => {
              setVisibleCount(visibleCount + PAGE_SIZE);
            }}
          >
            See more
            <Icon name="chevron" />
          </Button>
        </div>
      )}
    </div>
  );
};
