"use client";

import { useState } from "react";
import { Icon } from "@components/Icon.tsx";
import type { Quote as CarouselQuote } from "@/Protocols/QuoteProtocol.ts";

const NUMBER_WIDTH = 2;

const isMarked = (line: string, highlights: string[]) => highlights.some((highlight) => line.includes(highlight));

const MARKER_HIDDEN = "data-[active=false]:bg-size-[0%_calc(var(--spacing)*3.5)]";

// Why: the marker under the highlighted words is drawn left to right once the quote is on screen (prototype, Quotes).
type QuoteTextProps = {
  quote: CarouselQuote;
  isActive: boolean;
};

const QuoteText = ({ quote, isActive }: QuoteTextProps) => (
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

type CounterProps = {
  number: number;
  isActive: boolean;
  onSelect: () => void;
  onFinish: () => void;
};

// Why: the active counter fills its bar in 4 seconds and the end of that animation moves to the next quote. With reduced motion there is no animation, so nothing moves by itself and the reader picks a quote.
const Counter = ({ number, isActive, onSelect, onFinish }: CounterProps) => (
  <button
    type="button"
    aria-current={isActive}
    onClick={onSelect}
    className="w-16 cursor-pointer border-0 bg-transparent p-0 text-left"
  >
    <span className={`block font-mono text-caption tracking-wide ${isActive ? "text-text" : "text-text-muted"}`}>
      <span className="sr-only">Quote </span>
      {String(number).padStart(NUMBER_WIDTH, "0")}
    </span>
    <span className="mt-2 block h-0.5 overflow-hidden rounded-sm bg-sunken">
      <span
        onAnimationEnd={onFinish}
        className={[
          "block h-0.5 origin-left bg-purple",
          isActive ? "animate-quote-progress motion-reduce:animate-none motion-reduce:scale-x-100" : "scale-x-0",
        ].join(" ")}
      />
    </span>
  </button>
);

export const QuoteCarousel = ({ quotes }: { quotes: CarouselQuote[] }) => {
  const [active, setActive] = useState(0);
  const next = () => {
    setActive((current) => (current + 1) % quotes.length);
  };
  return (
    <div className="flex flex-col items-center text-text">
      <Icon name="quote" className="size-10 max-md:size-8" />
      <div className="mt-7 grid w-full">
        {quotes.map((quote, index) => (
          <div
            key={quote.lines.join(" ")}
            aria-hidden={index !== active}
            className={[
              "col-start-1 row-start-1 flex items-center justify-center transition-[opacity,transform,visibility] duration-500 motion-reduce:transition-none",
              index === active ? "translate-y-0 opacity-100" : "invisible opacity-0",
              index < active ? "-translate-y-3.5" : "",
              index > active ? "translate-y-4.5" : "",
            ].join(" ")}
          >
            <QuoteText quote={quote} isActive={index === active} />
          </div>
        ))}
      </div>
      <div className="mt-14 flex gap-4">
        {quotes.map((quote, index) => (
          <Counter
            key={quote.lines.join(" ")}
            number={index + 1}
            isActive={index === active}
            onSelect={() => {
              setActive(index);
            }}
            onFinish={next}
          />
        ))}
      </div>
    </div>
  );
};
