import type { ReactNode } from "react";

export const NavbarRoot = ({ children }: { children: ReactNode }) => {
  return <header className="fixed inset-x-0 top-0 z-40 animate-fade-in motion-reduce:animate-none">{children}</header>;
};
