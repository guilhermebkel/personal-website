"use client";

import { useRef } from "react";

export const PostImage = ({ src, alt }: { src: string; alt: string }) => {
  // Why: a screenshot is too small to read on a phone, so a tap opens the same image at full size in the native dialog; Esc, a tap anywhere and the focus return come from the dialog itself, and the page keeps its scroll position.
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label={`Open image: ${alt}`}
        onClick={() => {
          dialogRef.current?.showModal();
        }}
        className="block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
      >
        {/* Why: a tall picture, like a top-down diagram on a phone, would grow past the window; it scales down to the figure height and keeps its proportions, and the dialog still opens it at full size. */}
        <img src={src} alt={alt} className="mb-0! h-auto max-h-figure-height w-full rounded-md object-contain" />
      </button>
      <dialog ref={dialogRef} className="m-0 size-full max-h-none max-w-none border-0 bg-graphite-deep p-0">
        <button
          type="button"
          aria-label="Close image"
          onClick={() => {
            dialogRef.current?.close();
          }}
          className="grid size-full cursor-zoom-out place-items-center border-0 bg-transparent p-4"
        >
          <img src={src} alt={alt} className="h-auto max-h-full w-auto max-w-full rounded-md" />
        </button>
      </dialog>
    </>
  );
};
