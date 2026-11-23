"use client";

import { SignatureLineIcon } from "@components/Icons/SignatureLineIcon.tsx";
import { useInView } from "@hooks/useInView.ts";

const SIGNATURE_THRESHOLD = 0.4;

// Why: the post ends with the author's handwriting, as in the approved prototype ("Written by"). When it comes into view the label rises, the name is written and the line under it is drawn.
export const PostSignature = () => {
  const { ref, isVisible } = useInView<HTMLDivElement>(SIGNATURE_THRESHOLD);
  return (
    <div ref={ref} data-visible={isVisible} className="group border-t-2 border-sunken pt-7">
      <p className="m-0 font-mono text-caption tracking-wider text-text-meta uppercase opacity-0 group-data-[visible=true]:animate-rise motion-reduce:animate-none motion-reduce:opacity-100">
        Written by
      </p>
      <p
        className={[
          "m-0 mt-2 w-max max-w-full font-signature text-hero-sm font-medium text-text max-md:text-title",
          "[animation-delay:300ms] [clip-path:inset(-10%_100%_-10%_0)] group-data-[visible=true]:animate-write motion-reduce:animate-none motion-reduce:[clip-path:none]",
        ].join(" ")}
      >
        Guilherme Mota
      </p>
      <SignatureLineIcon className="-mt-1.5 block h-6 w-130 max-w-full" />
    </div>
  );
};
