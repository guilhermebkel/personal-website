"use client";

import { useEffect, useRef } from "react";

const FULL = 1;

// Why: a post is long, so a thin purple bar at the top of the screen shows how far the reader is (prototype, Post). It follows the scroll, it is not an animation, so reduced motion keeps it.
export const ReadingProgress = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const bar = barRef.current;
      if (bar === null) {
        return;
      }
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      const clamped = Math.min(ratio, FULL);
      bar.style.transform = `scaleX(${clamped})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.75 bg-sunken">
      <div ref={barRef} style={{ transform: "scaleX(0)" }} className="h-0.75 origin-left bg-purple" />
    </div>
  );
};
