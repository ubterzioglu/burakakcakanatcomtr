import type { MetadataRoute } from "next";

import { getPublicSiteSnapshot } from "@/lib/site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await getPublicSiteSnapshot();
  const base = "https://burakakcakanat.com.tr";

  return [
    {
      url: base
    },
    {
      url: `${base}/mvp`,
      lastModified: new Date()
    },
    {
      url: `${base}/mvp/insights`,
      lastModified: new Date()
    },
    {
      url: `${base}/mvp/contact`,
      lastModified: new Date()
    },
    ...snapshot.ventures.map((venture) => ({
      url: `${base}/mvp/ventures/${venture.slug}`,
      lastModified: new Date()
    })),
    ...snapshot.insights.map((insight) => ({
      url: `${base}/mvp/insights/${insight.slug}`,
      lastModified: new Date(insight.publishedAt)
    }))
  ];
}
