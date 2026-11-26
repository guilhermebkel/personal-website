import type { ReactNode } from "react";

const CODE_BODY_CLASS = "mb-0! rounded-none! border-0! bg-surface! px-5! py-4! whitespace-pre! overflow-x-auto!";

const SCROLL_PROPS = { tabIndex: 0 };

export const CodeBody = ({ children }: { children: ReactNode }) => (
  // Why: a code line can be wider than the screen, so the block scrolls and must take the keyboard focus for a reader without a mouse.
  <pre {...SCROLL_PROPS} className={CODE_BODY_CLASS}>
    {children}
  </pre>
);
