import { useState } from "react";
import type { PostBrowserState, PostOrder, PostView } from "@components/PostBrowser/PostBrowserContext.ts";
import type { Post } from "@/Protocols/PostProtocol.ts";

const PAGE_SIZE = 6;

const sortPosts = (posts: Post[], order: PostOrder) => {
  const sorted = [...posts].sort((first, second) => second.date.localeCompare(first.date));
  if (order === "recent") {
    return sorted;
  }
  return sorted.reverse();
};

export const usePostBrowser = (posts: Post[]): PostBrowserState => {
  const [order, setOrder] = useState<PostOrder>("recent");
  const [view, setView] = useState<PostView>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visible = sortPosts(posts, order).slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;
  const showMore = () => {
    setVisibleCount(visibleCount + PAGE_SIZE);
  };
  return { order, setOrder, view, setView, visible, hasMore, showMore };
};
