"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconButton } from "@components/IconButton.tsx";
import { LogoIcon } from "@components/Icons/LogoIcon.tsx";
import { PAGE_X } from "@components/LayoutClasses.ts";
import { Link } from "@components/Link.tsx";
import { ReadingProgress } from "@components/ReadingProgress.tsx";
import { SocialBar } from "@components/SocialBar.tsx";

type MenuItem = {
  label: string;
  href: string;
  isExternal?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Projects", href: "/#projects" },
  { label: "Posts", href: "/blog/" },
  { label: "About", href: "https://about.guilherr.me", isExternal: true },
];

const MOBILE_MENU_ID = "mobile-menu";

const isCurrent = (pathname: string, item: MenuItem) => {
  if (item.isExternal === true || item.href.startsWith("/#")) {
    return false;
  }
  return pathname.startsWith(item.href);
};

const POST_PATH = /^\/blog\/[^/]+\/?$/u;
const NUMBER_WIDTH = 2;
const LOGO_LABEL = "Guilherme Mota, home";

export const Navbar = () => {
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

  // Why: the reading bar belongs to the navbar (it sits above it, at the top edge), and only a post is long enough to need it.
  const isPost = POST_PATH.test(pathname);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 animate-fade-in motion-reduce:animate-none">
      {isPost && <ReadingProgress />}
      {isOpen && <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 -z-20 bg-graphite-deep/45 md:hidden" />}
      <div
        data-scrolled={isScrolled}
        data-open={isOpen}
        className={[
          `group relative isolate flex h-navbar items-center justify-between ${PAGE_X}`,
          "before:absolute before:inset-0 before:-z-10 before:origin-top before:scale-y-0 before:rounded-b-lg before:bg-panel",
          "before:transition-transform before:duration-500 data-[scrolled=true]:before:scale-y-100 data-[open=true]:before:scale-y-0",
        ].join(" ")}
      >
        <NextLink href="/" aria-label={LOGO_LABEL} className="inline-block text-text hover:animate-shake group-data-[open=true]:text-ink">
          <LogoIcon className="h-10 w-auto" />
        </NextLink>
        <nav aria-label="Main">
          <ul className="m-0 hidden list-none items-center gap-6 p-0 md:flex">
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  target={item.isExternal === true ? "_blank" : undefined}
                  aria-current={isCurrent(pathname, item) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="md:hidden group-data-[open=true]:text-text-inverted">
            <IconButton
              icon={isOpen ? "close" : "menu"}
              label={isOpen ? "Close the menu" : "Open the menu"}
              ariaExpanded={isOpen}
              ariaControls={MOBILE_MENU_ID}
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            />
          </div>
        </nav>
      </div>
      {isOpen && (
        <div
          id={MOBILE_MENU_ID}
          className="absolute inset-x-0 top-0 -z-10 flex h-145 flex-col rounded-b-lg bg-menu px-5 pt-navbar pb-7 text-text-inverted md:hidden"
        >
          <ol className="m-0 mt-7 list-none border-b-2 border-menu-line p-0">
            {MENU_ITEMS.map((item, index) => (
              <li key={item.label} className="border-t-2 border-menu-line">
                <NextLink
                  href={item.href}
                  target={item.isExternal === true ? "_blank" : undefined}
                  onClick={closeMenu}
                  className="flex items-baseline gap-4 py-3.5 text-text-inverted no-underline"
                >
                  <span className="font-mono text-caption tracking-wide text-text-disabled">{String(index + 1).padStart(NUMBER_WIDTH, "0")}</span>
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
      )}
    </header>
  );
};
