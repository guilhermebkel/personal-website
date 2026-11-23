import { QuoteCarouselText } from "@components/QuoteCarousel/QuoteCarouselText.tsx";
import type { Quote } from "@/Protocols/QuoteProtocol.ts";

type QuoteCarouselSlideProps = {
  quote: Quote;
  isActive: boolean;
  isBefore: boolean;
};

// Why: a quote waits 18px below, rises into place, and leaves 14px upward, as in the prototype (Quotes).
export const QuoteCarouselSlide = ({ quote, isActive, isBefore }: QuoteCarouselSlideProps) => {
  const position = isBefore ? "-translate-y-3.5" : "translate-y-4.5";
  return (
    <div
      aria-hidden={!isActive}
      className={[
        "col-start-1 row-start-1 flex items-center justify-center transition-[opacity,transform,visibility] duration-500 motion-reduce:transition-none",
        isActive ? "translate-y-0 opacity-100" : `invisible opacity-0 ${position}`,
      ].join(" ")}
    >
      <QuoteCarouselText quote={quote} isActive={isActive} />
    </div>
  );
};
