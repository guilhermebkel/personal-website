import type { Quote } from "@/Protocols/QuoteProtocol.ts";

type QuoteCarouselTextProps = {
  quote: Quote;
  isActive: boolean;
};

const MARKER_HIDDEN = "data-[active=false]:bg-size-[0%_calc(var(--spacing)*3.5)]";

const isMarked = (line: string, highlights: string[]) => highlights.some((highlight) => line.includes(highlight));

export const QuoteCarouselText = ({ quote, isActive }: QuoteCarouselTextProps) => (
  // Why: the marker under the highlighted words is drawn left to right once the quote is on screen (prototype, Quotes).
  <p className="m-0 text-center text-title font-light italic max-md:leading-8 md:text-quote md:whitespace-nowrap">
    {quote.lines.map((line) => (
      <span key={line} className="block">
        {isMarked(line, quote.highlights) ? (
          <span
            data-active={isActive}
            className={`duration-marker marker-fill transition-[background-size] ease-out ${MARKER_HIDDEN} motion-reduce:transition-none`}
          >
            {line}
          </span>
        ) : (
          line
        )}
      </span>
    ))}
  </p>
);
