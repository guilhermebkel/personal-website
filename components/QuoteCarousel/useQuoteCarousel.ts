import { useState } from "react";
import type { QuoteCarouselState } from "@components/QuoteCarousel/QuoteCarouselContext.ts";
import type { Quote } from "@/Protocols/QuoteProtocol.ts";

export const useQuoteCarousel = (quotes: Quote[]): QuoteCarouselState => {
  const [active, setActive] = useState(0);
  const select = (index: number) => {
    setActive(index);
  };
  const moveToNext = () => {
    setActive((current) => (current + 1) % quotes.length);
  };
  return { quotes, active, select, moveToNext };
};
