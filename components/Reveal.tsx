"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@hooks/useInView.ts";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  as?: "div" | "li";
  className?: string;
  isAboveFold?: boolean;
};

const SEEN_THRESHOLD = 0.15;

export const Reveal = ({ children, delay = 0, as: Tag = "div", className = "", isAboveFold = false }: RevealProps) => {
  // Why: milliseconds to wait after the block is seen, so a group of blocks enters one after the other.
  // Why: each block of the prototype rises 18px and fades in when it comes into view. It stays hidden until seen, then plays once; with reduced motion it is simply there.
  const { ref, isVisible } = useInView<HTMLDivElement & HTMLLIElement>(SEEN_THRESHOLD);
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  // Why: a block already on screen when the page loads plays its entrance with CSS alone; waiting for the observer and the script held back the post title, the largest element of the page.
  const entrance = isAboveFold
    ? "animate-rise motion-reduce:animate-none"
    : "opacity-0 data-[visible=true]:animate-rise motion-reduce:animate-none motion-reduce:opacity-100";
  return (
    <Tag ref={ref} data-visible={isVisible} style={style} className={`${entrance} ${className}`}>
      {children}
    </Tag>
  );
};
