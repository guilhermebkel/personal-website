import { createContext, useContext } from "react";
import type { Quote } from "@/Protocols/QuoteProtocol.ts";

export type QuoteCarouselState = {
  quotes: Quote[];
  active: number;
  select: (index: number) => void;
  moveToNext: () => void;
};

export const QuoteCarouselContext = createContext<QuoteCarouselState | null>(null);

export const useQuoteCarouselState = (): QuoteCarouselState => {
  const state = useContext(QuoteCarouselContext);
  if (state === null) {
    throw new Error("A quote carousel part must be inside a QuoteCarousel.");
  }
  return state;
};
