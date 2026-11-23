import type { ReactNode } from "react";

export const PostBrowserToolbar = ({ children }: { children: ReactNode }) => {
  return <div className="mt-12 flex items-center justify-between gap-4">{children}</div>;
};
