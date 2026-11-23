import type { ReactNode } from "react";

export const QuoteCarouselRoot = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col items-center text-text">{children}</div>;
};
