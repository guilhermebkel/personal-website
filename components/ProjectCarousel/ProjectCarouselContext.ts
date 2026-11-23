import { createContext, useContext, type RefObject } from "react";

export type CarouselProject = {
  name: string;
  description: string;
  url: string;
  tags: string[];
};

export type ProjectCarouselState = {
  projects: CarouselProject[];
  trackRef: RefObject<HTMLUListElement | null>;
  canScrollBack: boolean;
  canScrollForward: boolean;
  // Why: how far the track is scrolled, from 0 (start) to 1 (end); the thumb under the cards follows it.
  progress: number;
  update: () => void;
  scrollBack: () => void;
  scrollForward: () => void;
};

export const ProjectCarouselContext = createContext<ProjectCarouselState | null>(null);

export const useProjectCarouselState = (): ProjectCarouselState => {
  const state = useContext(ProjectCarouselContext);
  if (state === null) {
    throw new Error("A project carousel part must be inside a ProjectCarousel.");
  }
  return state;
};
