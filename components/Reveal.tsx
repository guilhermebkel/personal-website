"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@hooks/useInView.ts";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li";
  className?: string;
  threshold?: number;
};

const SEEN_THRESHOLD = 0.15;

export const Reveal = ({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  threshold = SEEN_THRESHOLD,
}: RevealProps) => {
  // Why: milliseconds to wait after the block is seen, so a group of blocks enters one after the other.
  // Why: a block taller than the window never shows 15% of its area at once (a long post is about 3% of one screen), so it would stay hidden for good; such a block passes threshold 0 and is revealed when its first pixel shows.
  // Why: each block of the prototype rises 18px and fades in when it comes into view. It stays hidden until seen, then plays once; with reduced motion it is simply there.
  const { ref, isVisible } = useInView<HTMLDivElement & HTMLLIElement>(threshold);
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  return (
    <Tag
      ref={ref}
      data-visible={isVisible}
      style={style}
      className={`opacity-0 data-[visible=true]:animate-rise motion-reduce:animate-none motion-reduce:opacity-100 ${className}`}
    >
      {children}
    </Tag>
  );
};
