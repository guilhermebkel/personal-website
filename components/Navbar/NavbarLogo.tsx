import NextLink from "next/link";
import { LogoIcon } from "@components/Icons/LogoIcon.tsx";

const LOGO_LABEL = "Guilherme Mota, home";

export const NavbarLogo = () => {
  return (
    <NextLink
      href="/"
      aria-label={LOGO_LABEL}
      className="-m-2.5 inline-block p-2.5 text-text group-data-[open=true]:text-text-inverted hover:animate-shake"
    >
      <LogoIcon className="h-10 w-auto" />
    </NextLink>
  );
};
