"use client";

import { useProjectCarouselState } from "@components/ProjectCarousel/ProjectCarouselContext.ts";
import { PAGE_X } from "@styles/LayoutClasses.ts";

const PERCENT = 100;

export const ProjectCarouselProgress = () => {
  // Why: with more cards than the screen shows, a thin thumb under them tells how far the row is scrolled (prototype, Projects). With nothing to scroll it is not drawn.
  const { canScrollBack, canScrollForward, progress } = useProjectCarouselState();
  if (!canScrollBack && !canScrollForward) {
    return null;
  }
  return (
    <div aria-hidden="true" className={`mt-10 ${PAGE_X}`}>
      <div className="h-0.5 w-60 rounded-sm bg-sunken">
        <div style={{ transform: `translateX(${progress * PERCENT}%)` }} className="h-0.5 w-1/2 rounded-sm bg-purple" />
      </div>
    </div>
  );
};
