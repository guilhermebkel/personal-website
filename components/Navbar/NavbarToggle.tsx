"use client";

import { IconButton } from "@components/IconButton.tsx";
import { useNavbarState } from "@components/Navbar/NavbarContext.ts";
import { NAVBAR_MENU_ID } from "@components/Navbar/NavbarMenu.tsx";

export const NavbarToggle = () => {
  const { isOpen, toggleMenu } = useNavbarState();
  return (
    <div className="md:hidden group-data-[open=true]:text-text-inverted">
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
