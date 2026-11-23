"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/Utils/HeadingSlugUtil.ts";

// Why: the index marks the section being read; the observer watches the h2 anchors the markdown renderer put in the page.
export const PostToc = ({ headings }: { headings: Heading[] }) => {
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

  return (
    <nav aria-label="On this page" className="sticky top-24 w-60 flex-none max-lg:hidden">
      <p className="m-0 mb-3 font-mono text-caption tracking-wide text-text-meta">ON THIS PAGE</p>
      <ul className="m-0 list-none p-0">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === activeId ? "location" : undefined}
              className="block border-l-2 border-sunken py-1.5 pl-4 text-small text-text-meta no-underline aria-[current=location]:border-purple aria-[current=location]:text-text"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
