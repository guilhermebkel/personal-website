export const TraceMarkIcon = ({ className }: { className?: string }) => {
  // Why: the 404 draws a curve that ends in a purple dot, a shape of our own from the prototype. Decoration only.
  return (
    <svg viewBox="0 0 1200 160" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 115 C 216 16 408 152 624 80 S 864 32 960 72"
        pathLength="1"
        className="animate-draw-path stroke-purple-light stroke-3 [stroke-dasharray:1] [stroke-linecap:round] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
      />
      <circle
        cx="960"
        cy="72"
        r="7"
        className="animate-fade-in fill-purple stroke-purple-light stroke-2 [animation-delay:var(--delay-trace-mark)] motion-reduce:animate-none"
      />
    </svg>
  );
};
