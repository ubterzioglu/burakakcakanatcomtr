import { randomUUID } from "node:crypto";

import { z } from "zod";

import {
  defaultHomepageSections,
  defaultInsights,
  defaultMediaAssets,
  defaultPublications,
  defaultSiteSettings,
  defaultTimeline,
  defaultVentures
} from "@/lib/default-content";
import {
  homepageSectionSchema,
  insightSchema,
  mediaAssetSchema,
  publicationSchema,
  siteSettingsSchema,
  timelineEntrySchema,
  ventureSchema
} from "@/lib/site-types";

const singletonSchema = siteSettingsSchema;
const collectionSchemas = {
  homepage_sections: z.array(homepageSectionSchema),
  ventures: z.array(ventureSchema),
  timeline_entries: z.array(timelineEntrySchema),
  publications: z.array(publicationSchema),
  insights: z.array(insightSchema),
  media_assets: z.array(mediaAssetSchema)
};

export type CollectionResourceName = keyof typeof collectionSchemas;
export type ResourceName = "site_settings" | CollectionResourceName;

export const fallbackResourceData = {
  site_settings: defaultSiteSettings,
  homepage_sections: defaultHomepageSections,
  ventures: defaultVentures,
  timeline_entries: defaultTimeline,
  publications: defaultPublications,
  insights: defaultInsights,
  media_assets: defaultMediaAssets
};

export function parseSingletonPayload(payload: unknown) {
  return singletonSchema.parse(payload);
}

export function parseCollectionPayload<TName extends CollectionResourceName>(
  resource: TName,
  payload: unknown
) {
  return collectionSchemas[resource].parse(payload);
}

export function normalizeCollectionForStorage(resource: CollectionResourceName, payload: unknown) {
  const rows = parseCollectionPayload(resource, payload);
  return rows.map((item, index) => {
    const published = "published" in item ? item.published : true;
    const slug = "slug" in item ? item.slug : null;
    const featured = "featured" in item ? item.featured : false;
    const publishedAt = "publishedAt" in item ? item.publishedAt : null;

    return {
      id: item.id || randomUUID(),
      slug,
      order_index: item.orderIndex ?? index,
      published,
      featured,
      published_at: publishedAt,
      payload: item
    };
  });
}
