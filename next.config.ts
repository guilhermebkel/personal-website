import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Why: the site is static (docs/adr/0001-static-site-from-files.md); `next build` writes it to `out/`.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
