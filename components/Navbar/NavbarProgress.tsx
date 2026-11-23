"use client";

import { useNavbarState } from "@components/Navbar/NavbarContext.ts";
import { ReadingProgress } from "@components/ReadingProgress.tsx";

export const NavbarProgress = () => {
  const { isPost } = useNavbarState();
  return isPost ? <ReadingProgress /> : null;
};
