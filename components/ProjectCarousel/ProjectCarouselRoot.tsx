import type { ReactNode } from "react";

export const ProjectCarouselRoot = ({ children }: { children: ReactNode }) => {
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-navbar">
      {children}
    </section>
  );
};
