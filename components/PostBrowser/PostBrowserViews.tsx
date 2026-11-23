"use client";

import { Icon, type IconName } from "@components/Icon.tsx";
import { usePostBrowserState, type PostView } from "@components/PostBrowser/PostBrowserContext.ts";

type ViewOption = {
  view: PostView;
  icon: IconName;
  label: string;
};

const VIEW_OPTIONS: ViewOption[] = [
  { view: "grid", icon: "grid", label: "Show as a grid" },
  { view: "list", icon: "list", label: "Show as a list" },
];

// Why: on a phone the posts are always one column, so the choice is only drawn from the tablet up.
export const PostBrowserViews = () => {
  const { view, setView } = usePostBrowserState();
  return (
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
  );
};
