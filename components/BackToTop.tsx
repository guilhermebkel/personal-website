"use client";

import type { MouseEvent } from "react";
import { Icon } from "@components/Icon.tsx";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const BackToTop = () => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Why: a link to #main leaves the hash in the address, so the next click on the same link does not jump again; the hash is cleared here.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? "auto" : "smooth";
    // Why: the top of the page, not the top of the main column: the navbar and the heading are above the column.
    window.scrollTo({ top: 0, behavior });
  };
  return (
    <a
      href="#main"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-small text-text-soft no-underline hover:text-text max-md:-my-3 max-md:py-3"
    >
      Back to top
      <Icon name="up" />
    </a>
  );
};
