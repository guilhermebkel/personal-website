"use client";

import { QuoteCarouselContext } from "@components/QuoteCarousel/QuoteCarouselContext.ts";
import { QuoteCarouselCounters } from "@components/QuoteCarousel/QuoteCarouselCounters.tsx";
import { QuoteCarouselMark } from "@components/QuoteCarousel/QuoteCarouselMark.tsx";
import { QuoteCarouselRoot } from "@components/QuoteCarousel/QuoteCarouselRoot.tsx";
import { QuoteCarouselSlides } from "@components/QuoteCarousel/QuoteCarouselSlides.tsx";
import { useQuoteCarousel } from "@components/QuoteCarousel/useQuoteCarousel.ts";
import type { Quote } from "@/Protocols/QuoteProtocol.ts";

export const QuoteCarousel = ({ quotes }: { quotes: Quote[] }) => {
  const state = useQuoteCarousel(quotes);
  return (
    <QuoteCarouselContext value={state}>
      <QuoteCarouselRoot>
        <QuoteCarouselMark />
        <QuoteCarouselSlides />
        <QuoteCarouselCounters />
      </QuoteCarouselRoot>
    </QuoteCarouselContext>
  );
};
