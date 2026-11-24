"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@hooks/useInView.ts";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li";
  className?: string;
  threshold?: number;
  isQuick?: boolean;
  isImmediate?: boolean;
};

const SEEN_THRESHOLD = 0.15;

export const Reveal = ({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  threshold = SEEN_THRESHOLD,
  isQuick = false,
  isImmediate = false,
}: RevealProps) => {
  // Why: milliseconds to wait after the block is seen, so a group of blocks enters one after the other.
  // Why: a block taller than the window never shows 15% of its area at once (a long post is about 3% of one screen), so it would stay hidden for good; such a block passes threshold 0 and is revealed when its first pixel shows.
  // Why: each block of the prototype rises 18px and fades in when it comes into view. It stays hidden until seen, then plays once; with reduced motion it is simply there.
  // Why: a block of the hero that may sit below the fold on a short phone plays on load, not when it is first seen; otherwise it waits for a scroll.
  const { ref, isVisible: isSeen } = useInView<HTMLDivElement & HTMLLIElement>(threshold);
  const isVisible = isImmediate || isSeen;
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  // Why: a card that enters a carousel is read at once, so it takes the hover duration (250 ms) instead of the page's rise (500 ms); it is a class, because the inline style may only set the delay.
  return (
    <Tag
      ref={ref}
      data-visible={isVisible}
      data-quick={isQuick}
      style={style}
      className={`opacity-0 data-[quick=true]:[animation-duration:var(--duration-hover)] data-[visible=true]:animate-rise motion-reduce:animate-none motion-reduce:opacity-100 ${className}`}
    >
      {children}
    </Tag>
  );
};
