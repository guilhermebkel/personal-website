// Why: the 404 draws a curve that ends in a purple dot, a shape of our own from the prototype. Decoration only.
export const TraceMarkIcon = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 1200 160" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 115 C 216 16 408 152 624 80 S 864 32 960 72"
        pathLength="1"
        className="stroke-purple-light stroke-3 [stroke-linecap:round] [stroke-dasharray:1] animate-draw-path motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
      />
      <circle cx="960" cy="72" r="7" className="fill-purple stroke-purple-light stroke-2 animate-fade-in [animation-delay:1400ms] motion-reduce:animate-none" />
    </svg>
  );
};
