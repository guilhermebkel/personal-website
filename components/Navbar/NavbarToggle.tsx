"use client";

import { IconButton } from "@components/IconButton.tsx";
import { useNavbarState } from "@components/Navbar/NavbarContext.ts";
import { NAVBAR_MENU_ID } from "@components/Navbar/NavbarMenu.tsx";

export const NavbarToggle = () => {
  const { isOpen, toggleMenu } = useNavbarState();
  // Why: the toggle stays above the open menu, so the menu can be closed from the same place.
  return (
    <div className="relative z-10 group-data-[open=true]:text-text-inverted md:hidden">
      <IconButton
        icon={isOpen ? "close" : "menu"}
        label={isOpen ? "Close the menu" : "Open the menu"}
        ariaExpanded={isOpen}
        ariaControls={NAVBAR_MENU_ID}
        onClick={toggleMenu}
      />
    </div>
  );
};
