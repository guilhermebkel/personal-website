export type NavbarItem = {
  label: string;
  href: string;
  isExternal?: boolean;
};

export const NAVBAR_ITEMS: NavbarItem[] = [
  { label: "Projects", href: "/#projects" },
  { label: "Posts", href: "/blog/" },
  { label: "About", href: "https://about.guilherr.me", isExternal: true },
];

export const isCurrentItem = (pathname: string, item: NavbarItem) => {
  if (item.isExternal === true || item.href.startsWith("/#")) {
    return false;
  }
  return pathname.startsWith(item.href);
};
