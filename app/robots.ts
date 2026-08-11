import type { MetadataRoute } from "next";

import { SITE_ORIGIN, siteUrl } from "@/lib/site";

/**
 * クローラ向け robots。sitemap は同オリジンの /sitemap.xml。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: siteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}
