"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@components/useInView.ts";

type SpotlightProps = {
  children: ReactNode;
  // Why: the band width must match the text it sits under, so the caller passes it (a CSS length); the default is the full width.
  width?: string;
  height?: string;
  bottom?: string;
  // Why: the band in the prototype pokes out 14px to the left and to the right of the word.
  left?: string;
  // Why: the band opens after the word is written, so the page asks for a wait (milliseconds).
  delay?: number;
};

const DEFAULT_WIDTH = "100%";
const DEFAULT_HEIGHT = "calc(var(--spacing) * 7)";
const DEFAULT_BOTTOM = "calc(var(--spacing) * -1)";
const DEFAULT_LEFT = "0px";

export const Spotlight = (props: SpotlightProps) => {
  const { children, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = props;
  const { bottom = DEFAULT_BOTTOM, left = DEFAULT_LEFT, delay = 0 } = props;
  const { ref, isVisible } = useInView<HTMLSpanElement>();
  const vars = { "--spotlight-w": width, "--spotlight-h": height, "--spotlight-bottom": bottom, "--spotlight-left": left, "--spotlight-delay": `${delay}ms` };
  const style = vars as CSSProperties;
  return (
    <span
      ref={ref}
      data-visible={isVisible}
      style={style}
      className={[
        "relative isolate inline-block",
        "after:absolute after:-z-10 after:left-(--spotlight-left) after:bottom-(--spotlight-bottom) after:h-(--spotlight-h) after:w-(--spotlight-w)",
        "after:origin-left after:scale-x-0 after:bg-purple after:marker-shape after:transition-transform after:duration-500 after:delay-(--spotlight-delay)",
        "data-[visible=true]:after:scale-x-100",
      ].join(" ")}
    >
      {children}
    </span>
  );
};
