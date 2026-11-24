import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const readManifest = (): MetadataRoute.Manifest => {
  // Why: the manifest names the icons that scripts/build-icons.mjs writes, so a phone that installs the site shows the mark.
  return {
    name: "guilherr.me",
    short_name: "guilherr.me",
    start_url: "/",
    display: "standalone",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
};

export default readManifest;
