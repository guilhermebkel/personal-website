import Link from "next/link";
import { Icon } from "@components/Icon.tsx";

export const SiteHeader = () => {
  return (
    <header className="mx-auto max-w-content px-4 py-8">
      <nav aria-label="Main">
        <Link href="/">guilherr.me</Link>
        {" · "}
        <Link href="/blog/">Posts</Link>
        {" · "}
        <a href="https://about.guilherr.me" className="inline-flex items-center gap-1">
          About
          <Icon name="external" />
        </a>
      </nav>
    </header>
  );
};
