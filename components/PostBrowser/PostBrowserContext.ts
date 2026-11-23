import { createContext, useContext } from "react";
import type { Post } from "@/Protocols/PostProtocol.ts";

export type PostOrder = "recent" | "oldest";
export type PostView = "grid" | "list";

export type PostBrowserState = {
  order: PostOrder;
  setOrder: (order: PostOrder) => void;
  view: PostView;
  setView: (view: PostView) => void;
  visible: Post[];
  hasMore: boolean;
  showMore: () => void;
};

export const PostBrowserContext = createContext<PostBrowserState | null>(null);

export const usePostBrowserState = (): PostBrowserState => {
  // Why: only the posts on screen (the first page, then one more page for each "See more"), already in the chosen order.
  const state = useContext(PostBrowserContext);
  if (state === null) {
    throw new Error("A post browser part must be inside a PostBrowser.");
  }
  return state;
};
