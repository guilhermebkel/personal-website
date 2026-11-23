"use client";

import { useQuoteCarouselState } from "@components/QuoteCarousel/QuoteCarouselContext.ts";
import { QuoteCarouselCounter } from "@components/QuoteCarousel/QuoteCarouselCounter.tsx";

export const QuoteCarouselCounters = () => {
  const { quotes } = useQuoteCarouselState();
  return (
    <div className="mt-14 flex gap-4">
      {quotes.map((quote, index) => (
        <QuoteCarouselCounter key={quote.lines.join(" ")} index={index} />
      ))}
    </div>
  );
};
