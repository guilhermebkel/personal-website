"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@components/Icon.tsx";
import { useActiveHeading } from "@hooks/useActiveHeading.ts";
import { HeadingSlugUtil, type Heading } from "@/Utils/HeadingSlugUtil.ts";

export const PostSectionBar = ({ headings }: { headings: Heading[] }) => {
  // Why: below lg there is no side index, so this bar under the navbar names the section being read and opens the full list; it sticks only while the body is on screen, because it sits inside the body column.
  const activeId = useActiveHeading(headings);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (headings.length === 0) {
    return null;
  }
  const activeIndex = Math.max(
    headings.findIndex((heading) => heading.id === activeId),
    0,
  );
  const active = headings[activeIndex];
  if (active === undefined) {
    return null;
  }

  return (
    <div ref={wrapperRef} className="sticky top-navbar z-30 bg-graphite lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="flex w-full items-center gap-3 border-0 border-b-2 border-sunken bg-graphite py-3 text-left font-sans"
      >
        <span className="font-mono text-caption text-text-meta">{HeadingSlugUtil.buildNumber(activeIndex)}</span>
        <span className="min-w-0 flex-1 truncate text-small text-text">{active.text}</span>
        <Icon name="chevron" className={isOpen ? "rotate-180" : undefined} />
      </button>
      <ul
        id={listId}
        hidden={!isOpen}
        className="absolute inset-x-0 top-full m-0 max-h-120 list-none overflow-y-auto border-b-2 border-sunken bg-raised p-0"
      >
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === activeId ? "location" : undefined}
              onClick={() => {
                setIsOpen(false);
              }}
              className="flex gap-3 px-5 py-3 text-small text-text-meta no-underline aria-[current=location]:text-text"
            >
              <span className="font-mono text-caption">{HeadingSlugUtil.buildNumber(index)}</span>
              <span className="min-w-0">{heading.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
