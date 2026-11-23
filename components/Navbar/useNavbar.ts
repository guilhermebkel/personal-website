import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavbarState } from "@components/Navbar/NavbarContext.ts";

const POST_PATH = /^\/blog\/[^/]+\/?$/u;

export const useNavbar = (): NavbarState => {
  // Why: the navbar knows where the reader is (the path), whether the page moved (the panel appears) and whether the phone menu is open. The parts only read this state.
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Why: the reading bar belongs to the navbar (it sits above it, at the top edge), and only a post is long enough to need it.
  const isPost = POST_PATH.test(pathname);

  return { pathname, isScrolled, isOpen, isPost, closeMenu, toggleMenu };
};
