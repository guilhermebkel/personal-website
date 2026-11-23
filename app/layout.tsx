import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/ubuntu/300.css";
import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/700.css";
import "@fontsource/caveat/400.css";
import "@fontsource/geist-mono/400.css";
import "./globals.css";
import { SkipLink } from "@components/SkipLink.tsx";
import { SiteHeader } from "@components/SiteHeader.tsx";

export const metadata: Metadata = {
  title: { default: "Guilherme Mota", template: "%s · Guilherme Mota" },
  description: "Notes on what I build, break and rebuild.",
  metadataBase: new URL("https://guilherr.me"),
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
