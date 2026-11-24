"use client";

import NextLink from "next/link";
import { useEffect, useRef } from "react";
import { NAVBAR_ITEMS } from "@components/Navbar/NavbarItems.ts";
import { useNavbarState } from "@components/Navbar/NavbarContext.ts";
import { SocialBar } from "@components/SocialBar.tsx";

export const NAVBAR_MENU_ID = "mobile-menu";

const NUMBER_WIDTH = 2;
const FOCUSABLE = "a[href], button:not([disabled])";
const TOGGLE_SELECTOR = `[aria-controls="${NAVBAR_MENU_ID}"]`;

type MenuKey = "Escape" | "Tab";
const MENU_KEYS: readonly MenuKey[] = ["Escape", "Tab"];

const isMenuKey = (key: string): key is MenuKey => MENU_KEYS.some((menuKey) => menuKey === key);

const moveFocus = (event: KeyboardEvent, menu: HTMLElement) => {
  // Why: while the menu is open, Tab cycles inside it; the page behind it is not reachable from the keyboard until it closes.
  const items = [...menu.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = items[0];
  const last = items.at(-1);
  if (first === undefined || last === undefined) {
    return;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
};

export const NavbarMenu = () => {
  // Why: on a phone the menu is a light panel that drops from the top, with the items numbered like the sections of the home (prototype, MenuMobile).
  const { isOpen, closeMenu } = useNavbarState();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    // Why: Escape closes the menu and hands the focus back to the toggle that opened it, so a keyboard reader is not left on the page's top.
    const keyToHandler: Record<MenuKey, (event: KeyboardEvent) => void> = {
      Escape: () => {
        closeMenu();
        document.querySelector<HTMLElement>(TOGGLE_SELECTOR)?.focus();
      },
      Tab: (event) => {
        if (menuRef.current !== null) {
          moveFocus(event, menuRef.current);
        }
      },
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (isMenuKey(event.key)) {
        keyToHandler[event.key](event);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeMenu]);

  if (!isOpen) {
    return null;
  }
  return (
    <div
      ref={menuRef}
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
