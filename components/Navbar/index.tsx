"use client";

import { NavbarBar } from "@components/Navbar/NavbarBar.tsx";
import { NavbarContext } from "@components/Navbar/NavbarContext.ts";
import { NavbarLinks } from "@components/Navbar/NavbarLinks.tsx";
import { NavbarLogo } from "@components/Navbar/NavbarLogo.tsx";
import { NavbarMenu } from "@components/Navbar/NavbarMenu.tsx";
import { NavbarNav } from "@components/Navbar/NavbarNav.tsx";
import { NavbarOverlay } from "@components/Navbar/NavbarOverlay.tsx";
import { NavbarProgress } from "@components/Navbar/NavbarProgress.tsx";
import { NavbarRoot } from "@components/Navbar/NavbarRoot.tsx";
import { NavbarToggle } from "@components/Navbar/NavbarToggle.tsx";
import { useNavbar } from "@components/Navbar/useNavbar.ts";

export const Navbar = () => {
  const state = useNavbar();
  return (
    <NavbarContext value={state}>
      <NavbarRoot>
        <NavbarProgress />
        <NavbarOverlay />
        <NavbarBar>
          <NavbarLogo />
          <NavbarNav>
            <NavbarLinks />
            <NavbarToggle />
          </NavbarNav>
        </NavbarBar>
        <NavbarMenu />
      </NavbarRoot>
    </NavbarContext>
  );
};
