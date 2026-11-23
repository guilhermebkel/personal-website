"use client";

import type { ReactNode } from "react";
import { useNavbarState } from "@components/Navbar/NavbarContext.ts";
import { PAGE_X } from "@styles/LayoutClasses.ts";

export const NavbarBar = ({ children }: { children: ReactNode }) => {
  const { isScrolled, isOpen } = useNavbarState();
  return (
    <div
      data-scrolled={isScrolled}
      data-open={isOpen}
      className={[
        `group relative isolate flex h-navbar items-center justify-between ${PAGE_X}`,
        "before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:rounded-b-lg before:bg-panel",
        "before:transition-transform before:duration-500 data-[scrolled=true]:before:scale-y-100 data-[open=true]:before:scale-y-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
};
