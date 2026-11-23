"use client";

import { Button } from "@components/Button.tsx";
import { Icon } from "@components/Icon.tsx";
import { usePostBrowserState } from "@components/PostBrowser/PostBrowserContext.ts";

export const PostBrowserMore = () => {
  const { hasMore, showMore } = usePostBrowserState();
  if (!hasMore) {
    return null;
  }
  return (
    <div className="mt-16 flex justify-center">
      <Button variant="primary" className="h-12" onClick={showMore}>
        See more
        <Icon name="chevron" />
      </Button>
    </div>
  );
};
