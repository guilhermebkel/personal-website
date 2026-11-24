import { ImageResponse } from "next/og";
import { OgCard } from "@components/OgCard.tsx";
import { OgImageUtil } from "@/Utils/OgImageUtil.ts";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

// Why: the share image is 1200 x 630 and is written at build time; Next declares it in og:image and twitter:image.
export const dynamic = "force-static";
export const size = OgImageUtil.SIZE;
export const contentType = "image/png";
export const alt = SiteUtil.NAME;

const HomeOgImage = async () =>
  new ImageResponse(<OgCard label="Home" title={SiteUtil.NAME} description={SiteUtil.DESCRIPTION} />, {
    ...OgImageUtil.SIZE,
    fonts: await OgImageUtil.readFonts(),
  });

export default HomeOgImage;
