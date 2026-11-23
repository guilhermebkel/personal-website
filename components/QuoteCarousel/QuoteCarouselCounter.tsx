"use client";

import { useQuoteCarouselState } from "@components/QuoteCarousel/QuoteCarouselContext.ts";

const NUMBER_WIDTH = 2;

// Why: the active counter fills its bar in 4 seconds and the end of that animation moves to the next quote. With reduced motion there is no animation, so nothing moves by itself and the reader picks a quote.
export const QuoteCarouselCounter = ({ index }: { index: number }) => {
  const { active, select, next } = useQuoteCarouselState();
  const isActive = index === active;
  const onSelect = () => {
    select(index);
  };
  return (
    <button
      type="button"
      aria-current={isActive}
      onClick={onSelect}
      className="w-16 cursor-pointer border-0 bg-transparent p-0 text-left"
    >
      <span className={`block font-mono text-caption tracking-wide ${isActive ? "text-text" : "text-text-muted"}`}>
        <span className="sr-only">Quote </span>
        {String(index + 1).padStart(NUMBER_WIDTH, "0")}
      </span>
      <span className="mt-2 block h-0.5 overflow-hidden rounded-sm bg-sunken">
        <span
          onAnimationEnd={next}
          className={[
            "block h-0.5 origin-left bg-purple",
            isActive ? "animate-quote-progress motion-reduce:scale-x-100 motion-reduce:animate-none" : "scale-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
};
