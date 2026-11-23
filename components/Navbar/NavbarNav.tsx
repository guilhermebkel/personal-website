import type { ReactNode } from "react";

export const NavbarNav = ({ children }: { children: ReactNode }) => {
  return <nav aria-label="Main">{children}</nav>;
};
