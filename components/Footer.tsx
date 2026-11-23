import NextLink from "next/link";
import { Icon } from "@components/Icon.tsx";
import { LogoIcon } from "@components/Icons/LogoIcon.tsx";
import { PAGE_X } from "@styles/LayoutClasses.ts";

export const Footer = () => {
  return (
    <footer
      className={`flex h-24 items-center justify-between gap-3 border-t border-sunken bg-graphite-deep ${PAGE_X}`}
    >
      <div className="flex items-center gap-5">
        <LogoIcon className="h-8 w-auto text-text-soft" />
        <span className="font-mono text-caption text-text-muted">© 2026 Guilherme Mota</span>
      </div>
      <NextLink
        href="#main"
        className="inline-flex items-center gap-2 text-small text-text-soft no-underline hover:text-text"
      >
        Back to top
        <Icon name="up" />
      </NextLink>
    </footer>
  );
};
