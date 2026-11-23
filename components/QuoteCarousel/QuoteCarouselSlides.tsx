"use client";

import { useQuoteCarouselState } from "@components/QuoteCarousel/QuoteCarouselContext.ts";
import { QuoteCarouselSlide } from "@components/QuoteCarousel/QuoteCarouselSlide.tsx";

// Why: every quote sits in the same grid cell, so the block is as tall as the tallest quote and nothing jumps when the quote changes.
export const QuoteCarouselSlides = () => {
  const { quotes, active } = useQuoteCarouselState();
  return (
    <div className="mt-7 grid w-full">
      {quotes.map((quote, index) => (
        <QuoteCarouselSlide
          key={quote.lines.join(" ")}
          quote={quote}
          isActive={index === active}
          isBefore={index < active}
        />
      ))}
    </div>
  );
};
