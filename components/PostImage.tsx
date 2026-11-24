"use client";

import Image from "next/image";
import { useRef } from "react";

// Why: the post images come from Markdown, so their size is not known at build time; width and height 0 with a CSS size lets the layout size them and skips the optimizer, which a static export does not have.
const RESPONSIVE = { width: 0, height: 0, sizes: "100vw", unoptimized: true } as const;

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
        <Image src={src} alt={alt} {...RESPONSIVE} className="mb-0! h-auto w-full rounded-md" />
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
          <Image src={src} alt={alt} {...RESPONSIVE} className="h-auto max-h-full w-auto max-w-full rounded-md" />
        </button>
      </dialog>
    </>
  );
};
