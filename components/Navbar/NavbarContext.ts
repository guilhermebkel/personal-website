import { createContext, useContext } from "react";

export type NavbarState = {
  pathname: string;
  isScrolled: boolean;
  isOpen: boolean;
  isPost: boolean;
  closeMenu: () => void;
  toggleMenu: () => void;
};

export const NavbarContext = createContext<NavbarState | null>(null);

export const useNavbarState = (): NavbarState => {
  const state = useContext(NavbarContext);
  if (state === null) {
    throw new Error("A navbar part must be inside a Navbar.");
  }
  return state;
};
