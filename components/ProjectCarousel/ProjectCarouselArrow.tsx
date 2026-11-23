"use client";

import { Icon } from "@components/Icon.tsx";
import { useProjectCarouselState } from "@components/ProjectCarousel/ProjectCarouselContext.ts";

type ProjectCarouselArrowProps = { direction: "left" | "right" };

export const ProjectCarouselArrow = ({ direction }: ProjectCarouselArrowProps) => {
  const { canScrollBack, canScrollForward, scrollBack, scrollForward } = useProjectCarouselState();
  const isBack = direction === "left";
  return (
    <button
      type="button"
      aria-label={isBack ? "Previous projects" : "Next projects"}
      disabled={isBack ? !canScrollBack : !canScrollForward}
      onClick={isBack ? scrollBack : scrollForward}
      className={[
        "inline-flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-purple-light bg-transparent p-0 text-text",
        "transition-colors duration-250 md:hover:bg-purple disabled:cursor-default disabled:border-border-strong disabled:text-line disabled:hover:bg-transparent",
      ].join(" ")}
    >
      <Icon name={direction} className="size-5" />
    </button>
  );
};
