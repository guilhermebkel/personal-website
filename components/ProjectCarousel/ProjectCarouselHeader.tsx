import type { ReactNode } from "react";
import { SectionTitle } from "@components/SectionTitle.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";

// Why: the arrows are for a pointer, so on a phone (where the cards are swiped) the row shows only the title.
export const ProjectCarouselHeader = ({ children }: { children: ReactNode }) => {
  return (
    <div className={PAGE_X}>
      <SectionTitle
        eyebrow="01 — Projects"
        title="Things I've built"
        action={<div className="flex gap-3 max-md:hidden">{children}</div>}
      />
    </div>
  );
};
