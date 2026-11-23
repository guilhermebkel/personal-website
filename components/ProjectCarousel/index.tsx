"use client";

import { ProjectCarouselArrow } from "@components/ProjectCarousel/ProjectCarouselArrow.tsx";
import { ProjectCarouselContext, type CarouselProject } from "@components/ProjectCarousel/ProjectCarouselContext.ts";
import { ProjectCarouselHeader } from "@components/ProjectCarousel/ProjectCarouselHeader.tsx";
import { ProjectCarouselProgress } from "@components/ProjectCarousel/ProjectCarouselProgress.tsx";
import { ProjectCarouselRoot } from "@components/ProjectCarousel/ProjectCarouselRoot.tsx";
import { ProjectCarouselTrack } from "@components/ProjectCarousel/ProjectCarouselTrack.tsx";
import { useProjectCarousel } from "@components/ProjectCarousel/useProjectCarousel.ts";

export const ProjectCarousel = ({ projects }: { projects: CarouselProject[] }) => {
  const state = useProjectCarousel(projects);
  return (
    <ProjectCarouselContext value={state}>
      <ProjectCarouselRoot>
        <ProjectCarouselHeader>
          <ProjectCarouselArrow direction="left" />
          <ProjectCarouselArrow direction="right" />
        </ProjectCarouselHeader>
        <ProjectCarouselTrack />
        <ProjectCarouselProgress />
      </ProjectCarouselRoot>
    </ProjectCarouselContext>
  );
};
