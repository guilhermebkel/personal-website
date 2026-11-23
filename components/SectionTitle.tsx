import type { ReactNode } from "react";
import { Reveal } from "@components/Reveal.tsx";
import { MotionUtil } from "@/Utils/MotionUtil.ts";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  // Why: the section's aria-labelledby points here, so the id must be on the heading the section names.
  headingId: string;
  // Why: the first screen of a page is its h1, so each page has one; the size stays the same either way.
  isPageTitle?: boolean;
  // Why: the right side of the row holds one action (the arrows of the carousel, "See all posts").
  action?: ReactNode;
};

const HEADING_STEP = 1;

export const SectionTitle = ({ eyebrow, title, headingId, isPageTitle = false, action }: SectionTitleProps) => {
  const Heading = isPageTitle ? "h1" : "h2";
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <Reveal>
          <p className="m-0 font-mono text-small tracking-wide text-purple-light">{eyebrow}</p>
        </Reveal>
        <Reveal delay={MotionUtil.delayFor(HEADING_STEP)} className="mt-4">
          <Heading
            id={headingId}
            className="m-0 max-w-245 text-section font-medium tracking-title text-text max-md:text-heading"
          >
            {title}
          </Heading>
        </Reveal>
      </div>
      {action}
    </div>
  );
};
