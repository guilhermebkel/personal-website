"use client";

import type { ChangeEvent } from "react";
import { Icon } from "@components/Icon.tsx";
import { usePostBrowserState } from "@components/PostBrowser/PostBrowserContext.ts";

export const PostBrowserOrder = () => {
  const { order, setOrder } = usePostBrowserState();
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setOrder(event.target.value === "oldest" ? "oldest" : "recent");
  };
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Order of the posts</span>
      <select
        value={order}
        onChange={onChange}
        className={[
          "h-11 cursor-pointer appearance-none rounded-pill border-2 border-border-strong bg-control py-0 pr-11 pl-5 font-sans",
          "text-body text-text transition-colors duration-250 md:hover:border-purple-light",
        ].join(" ")}
      >
        <option value="recent">Most recent</option>
        <option value="oldest">Oldest first</option>
      </select>
      <Icon name="chevron" className="pointer-events-none absolute right-4 size-4 text-text-soft" />
    </label>
  );
};
