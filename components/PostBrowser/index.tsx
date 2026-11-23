"use client";

import { PostBrowserContext } from "@components/PostBrowser/PostBrowserContext.ts";
import { PostBrowserList } from "@components/PostBrowser/PostBrowserList.tsx";
import { PostBrowserMore } from "@components/PostBrowser/PostBrowserMore.tsx";
import { PostBrowserOrder } from "@components/PostBrowser/PostBrowserOrder.tsx";
import { PostBrowserRoot } from "@components/PostBrowser/PostBrowserRoot.tsx";
import { PostBrowserToolbar } from "@components/PostBrowser/PostBrowserToolbar.tsx";
import { PostBrowserViews } from "@components/PostBrowser/PostBrowserViews.tsx";
import { usePostBrowser } from "@components/PostBrowser/usePostBrowser.ts";
import type { Post } from "@/Protocols/PostProtocol.ts";

export const PostBrowser = ({ posts }: { posts: Post[] }) => {
  const state = usePostBrowser(posts);
  return (
    <PostBrowserContext value={state}>
      <PostBrowserRoot>
        <PostBrowserToolbar>
          <PostBrowserOrder />
          <PostBrowserViews />
        </PostBrowserToolbar>
        <PostBrowserList />
        <PostBrowserMore />
      </PostBrowserRoot>
    </PostBrowserContext>
  );
};
