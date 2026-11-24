"use client";

import { useActiveHeading } from "@hooks/useActiveHeading.ts";
import { HeadingSlugUtil, type Heading } from "@/Utils/HeadingSlugUtil.ts";

export const PostToc = ({ headings }: { headings: Heading[] }) => {
  const activeId = useActiveHeading(headings);

  return (
    <nav aria-label="On this page" className="sticky top-24 w-60 flex-none max-lg:hidden">
      <p className="m-0 mb-3 font-mono text-caption tracking-wide text-text-meta">ON THIS PAGE</p>
      <ul className="m-0 list-none p-0">
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === activeId ? "location" : undefined}
              className="flex gap-3 border-l-2 border-sunken py-1.5 pl-4 text-small text-text-meta no-underline aria-[current=location]:border-purple aria-[current=location]:text-text"
            >
              <span className="font-mono text-caption">{HeadingSlugUtil.buildNumber(index)}</span>
              <span>{heading.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
