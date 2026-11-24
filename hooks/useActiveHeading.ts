import { useEffect, useState } from "react";
import type { Heading } from "@/Utils/HeadingSlugUtil.ts";

export const useActiveHeading = (headings: Heading[]) => {
  // Why: the index and the phone bar mark the section being read; the observer watches the h2 anchors the markdown renderer put in the page.
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const found = headings.map((heading) => document.getElementById(heading.id));
    const elements = found.filter((element) => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible !== undefined) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    elements.forEach((element) => {
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return activeId;
};
