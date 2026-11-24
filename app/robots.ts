import type { MetadataRoute } from "next";
import { SiteUtil } from "@/Utils/SiteUtil.ts";

export const dynamic = "force-static";

const readRobots = (): MetadataRoute.Robots => ({
  rules: { userAgent: "*", allow: "/" },
  sitemap: SiteUtil.buildUrl("/sitemap.xml"),
});

export default readRobots;
