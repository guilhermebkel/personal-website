import Link from "next/link";

export const SiteHeader = () => {
  return (
    <header className="page">
      <nav aria-label="Main">
        <Link href="/">guilherr.me</Link>
        {" · "}
        <Link href="/blog/">Posts</Link>
        {" · "}
        <a href="https://about.guilherr.me">About</a>
      </nav>
    </header>
  );
};
