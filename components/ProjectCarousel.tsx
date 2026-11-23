"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@components/Icon.tsx";
import { PAGE_X } from "@components/LayoutClasses.ts";
import { Reveal } from "@components/Reveal.tsx";
import { ProjectCard } from "@components/ProjectCard.tsx";
import { SectionTitle } from "@components/SectionTitle.tsx";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

type CarouselProject = {
  name: string;
  description: string;
  url: string;
  tags: string[];
};

type ArrowButtonProps = {
  direction: "left" | "right";
  isDisabled: boolean;
  onClick: () => void;
};

const ArrowButton = ({ direction, isDisabled, onClick }: ArrowButtonProps) => (
  <button
    type="button"
    aria-label={direction === "left" ? "Previous projects" : "Next projects"}
    disabled={isDisabled}
    onClick={onClick}
    className={[
      "inline-flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-purple-light bg-transparent p-0 text-text",
      "transition-colors duration-250 md:hover:bg-purple disabled:cursor-default disabled:border-border-strong disabled:text-line disabled:hover:bg-transparent",
    ].join(" ")}
  >
    <Icon name={direction} className="size-5" />
  </button>
);

const CARD_STEP_PX = 408;
const PERCENT = 100;

export const ProjectCarousel = ({ projects }: { projects: CarouselProject[] }) => {
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

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-navbar">
      <div className={PAGE_X}>
        <SectionTitle
          eyebrow="01 — Projects"
          title="Things I've built"
          action={(
            <div className="flex gap-3 max-md:hidden">
              <ArrowButton direction="left" isDisabled={!canScrollBack} onClick={scrollBack} />
              <ArrowButton direction="right" isDisabled={!canScrollForward} onClick={scrollForward} />
            </div>
          )}
        />
      </div>
      <ul
        ref={trackRef}
        onScroll={update}
        className={`m-0 mt-10 flex list-none snap-x gap-6 overflow-x-auto p-0 pb-2 ${PAGE_X} scroll-px-5 md:scroll-px-12 xl:scroll-px-30`}
      >
        {projects.map((project, index) => (
          <Reveal key={project.name} as="li" delay={MotionUtil.delayFor(index)} className="flex snap-start">
            <ProjectCard index={index} {...project} />
          </Reveal>
        ))}
      </ul>
      {(canScrollBack || canScrollForward) && (
        <div aria-hidden="true" className={`mt-10 ${PAGE_X}`}>
          <div className="h-0.5 w-60 rounded-sm bg-sunken">
            <div
              style={{ transform: `translateX(${progress * PERCENT}%)` }}
              className="h-0.5 w-1/2 rounded-sm bg-purple"
            />
          </div>
        </div>
      )}
    </section>
  );
};
