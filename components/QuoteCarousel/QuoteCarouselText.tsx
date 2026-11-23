import type { Quote } from "@/Protocols/QuoteProtocol.ts";

type QuoteCarouselTextProps = {
  quote: Quote;
  isActive: boolean;
};

const MARKER_HIDDEN = "data-[active=false]:bg-size-[0%_calc(var(--spacing)*3.5)]";

const isMarked = (line: string, highlights: string[]) => highlights.some((highlight) => line.includes(highlight));

// Why: the marker under the highlighted words is drawn left to right once the quote is on screen (prototype, Quotes).
export const QuoteCarouselText = ({ quote, isActive }: QuoteCarouselTextProps) => (
  <p className="m-0 text-center text-title max-md:leading-8 font-light italic md:text-quote md:whitespace-nowrap">
    {quote.lines.map((line) => (
      <span key={line} className="block">
        {isMarked(line, quote.highlights)
          ? (
              <span
                data-active={isActive}
                className={`marker-fill transition-[background-size] duration-700 ease-out ${MARKER_HIDDEN} motion-reduce:transition-none`}
              >
                {line}
              </span>
            )
          : line}
      </span>
    ))}
  </p>
);
