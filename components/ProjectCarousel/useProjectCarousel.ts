import { useEffect, useRef, useState } from "react";
import type { CarouselProject, ProjectCarouselState } from "@components/ProjectCarousel/ProjectCarouselContext.ts";

const CARD_STEP_PX = 408;

export const useProjectCarousel = (projects: CarouselProject[]): ProjectCarouselState => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);
  const [progress, setProgress] = useState(0);

  const update = () => {
    const track = trackRef.current;
    if (track === null) {
      return;
    }
    setCanScrollBack(track.scrollLeft > 0);
    setCanScrollForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    const scrollable = track.scrollWidth - track.clientWidth;
    setProgress(scrollable > 0 ? track.scrollLeft / scrollable : 0);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * CARD_STEP_PX, behavior: "smooth" });
  };
  const scrollBack = () => {
    scrollBy(-1);
  };
  const scrollForward = () => {
    scrollBy(1);
  };

  return { projects, trackRef, canScrollBack, canScrollForward, progress, update, scrollBack, scrollForward };
};
