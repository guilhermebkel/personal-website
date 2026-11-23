"use client";

import { useNavbarState } from "@components/Navbar/NavbarContext.ts";

export const NavbarOverlay = () => {
  // Why: behind the phone menu, a tap on the dimmed page closes it.
  const { isOpen, closeMenu } = useNavbarState();
  return isOpen ? (
    <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 -z-20 bg-graphite-deep/45 md:hidden" />
  ) : null;
};
