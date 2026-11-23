"use client";

import NextLink from "next/link";
import { NAVBAR_ITEMS } from "@components/Navbar/NavbarItems.ts";
import { useNavbarState } from "@components/Navbar/NavbarContext.ts";
import { SocialBar } from "@components/SocialBar.tsx";

export const NAVBAR_MENU_ID = "mobile-menu";

const NUMBER_WIDTH = 2;

export const NavbarMenu = () => {
  // Why: on a phone the menu is a light panel that drops from the top, with the items numbered like the sections of the home (prototype, MenuMobile).
  const { isOpen, closeMenu } = useNavbarState();
  if (!isOpen) {
    return null;
  }
  return (
    <div
      id={NAVBAR_MENU_ID}
      className="absolute inset-x-0 top-0 -z-10 flex h-145 flex-col rounded-b-lg bg-menu px-5 pt-navbar pb-7 text-text-inverted md:hidden"
    >
      <ol className="m-0 mt-7 list-none border-b-2 border-menu-line p-0">
        {NAVBAR_ITEMS.map((item, index) => (
          <li key={item.label} className="border-t-2 border-menu-line">
            <NextLink
              href={item.href}
              target={item.isExternal === true ? "_blank" : undefined}
              onClick={closeMenu}
              className="flex items-baseline gap-4 py-3.5 text-text-inverted no-underline"
            >
              <span className="font-mono text-caption tracking-wide text-text-disabled">
                {String(index + 1).padStart(NUMBER_WIDTH, "0")}
              </span>
              <span className="text-menu-item font-medium tracking-title">{item.label}</span>
            </NextLink>
          </li>
        ))}
      </ol>
      <div className="mt-auto flex items-center justify-between">
        <SocialBar isBare />
        <span className="font-mono text-caption text-text-disabled">© 2026</span>
      </div>
    </div>
  );
};
