"use client";

import { Link } from "@components/Link.tsx";
import { isCurrentItem, NAVBAR_ITEMS } from "@components/Navbar/NavbarItems.ts";
import { useNavbarState } from "@components/Navbar/NavbarContext.ts";

export const NavbarLinks = () => {
  const { pathname } = useNavbarState();
  return (
    <ul className="m-0 hidden list-none items-center gap-6 p-0 md:flex">
      {NAVBAR_ITEMS.map((item) => (
        <li key={item.label}>
          <Link
            href={item.href}
            target={item.isExternal === true ? "_blank" : undefined}
            aria-current={isCurrentItem(pathname, item) ? "page" : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};
