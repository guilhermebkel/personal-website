export const LINK_CLASS = [
  "relative isolate inline-flex items-center gap-1 overflow-hidden pr-2 text-body text-text no-underline",
  "before:absolute before:inset-x-0 before:bottom-0 before:-z-10 before:h-3.5 before:origin-left before:scale-x-0",
  "before:bg-purple before:marker-shape before:transition-transform before:duration-300 before:ease-out",
  "md:hover:before:scale-x-100 md:active:before:scale-x-100 aria-[current=page]:before:scale-x-100",
  "focus-visible:-outline-offset-2 focus-visible:before:scale-x-100",
  "aria-disabled:pointer-events-none aria-disabled:text-text-disabled aria-disabled:before:scale-x-0",
].join(" ");
