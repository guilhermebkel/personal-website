export const SignatureLineIcon = ({ className }: { className?: string }) => {
  // Why: the handwritten line under the signature is a drawn stroke from the prototype. Decoration only.
  return (
    <svg viewBox="0 0 520 24" fill="none" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path
        d="M4 16 C120 4 300 24 516 8"
        pathLength="1"
        className="stroke-purple-light stroke-3 [animation-delay:1100ms] [stroke-dasharray:1] [stroke-dashoffset:1] [stroke-linecap:round] group-data-[visible=true]:animate-draw-path motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
      />
    </svg>
  );
};
