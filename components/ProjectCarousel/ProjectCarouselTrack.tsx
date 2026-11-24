"use client";

import { ProjectCard } from "@components/ProjectCard.tsx";
import { useProjectCarouselState } from "@components/ProjectCarousel/ProjectCarouselContext.ts";
import { Reveal } from "@components/Reveal.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

export const ProjectCarouselTrack = () => {
  const { projects, trackRef, update } = useProjectCarouselState();
  return (
    <ul
      ref={trackRef}
      onScroll={update}
      className={`m-0 mt-9 flex snap-x [scrollbar-width:none] list-none gap-6 overflow-x-auto p-0 pt-1 pb-2 [&::-webkit-scrollbar]:hidden ${PAGE_X} scroll-px-5 md:scroll-px-12 xl:scroll-px-30`}
    >
      {projects.map((project, index) => (
        <Reveal key={project.name} as="li" delay={MotionUtil.getStaggerDelay(index)} className="flex snap-start">
          <ProjectCard index={index} {...project} />
        </Reveal>
      ))}
    </ul>
  );
};
