import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * 公開ページの簡易 sitemap。hreflang 付きの本格版は i18n（#24）で足す。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: siteUrl("/app"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: siteUrl("/terms"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: siteUrl("/privacy"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
