import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/ubuntu/300.css";
import "@fontsource/ubuntu/300-italic.css";
import "@fontsource/ubuntu/400.css";
import "@fontsource/ubuntu/500.css";
import "@fontsource/ubuntu/700.css";
import "@fontsource/caveat/500.css";
import "@fontsource/geist-mono/400.css";
import "./globals.css";
import { ContoursIcon } from "@components/Icons/ContoursIcon.tsx";
import { Footer } from "@components/Footer.tsx";
import { Navbar } from "@components/Navbar/index.tsx";
import { SkipLink } from "@components/SkipLink.tsx";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

export const metadata: Metadata = {
  title: { default: "Guilherme Mota", template: "%s · Guilherme Mota" },
  description: SiteUtil.DESCRIPTION,
  metadataBase: new URL(SiteUtil.URL),
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Navbar />
        <div className="relative isolate overflow-x-clip">
          <ContoursIcon />
          <main id="main" tabIndex={-1} className="pt-navbar outline-none">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
