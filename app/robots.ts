import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * クローラ向け robots。sitemap は同オリジンの /sitemap.xml。
 * `Host` は出さない（プロトコル付きオリジンを誤って載せないため。sitemap で十分）。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
