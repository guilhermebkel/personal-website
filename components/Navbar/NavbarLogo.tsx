import NextLink from "next/link";
import { LogoIcon } from "@components/Icons/LogoIcon.tsx";

const LOGO_LABEL = "Guilherme Mota, home";

export const NavbarLogo = () => {
  return (
    <NextLink href="/" aria-label={LOGO_LABEL} className="inline-block text-text hover:animate-shake group-data-[open=true]:text-ink">
      <LogoIcon className="h-10 w-auto" />
    </NextLink>
  );
};
