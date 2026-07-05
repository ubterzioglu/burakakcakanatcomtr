import { randomUUID } from "node:crypto";

import {
  defaultSiteSnapshot,
  defaultSiteSettings
} from "@/lib/default-content";
import { getLocale } from "@/lib/i18n";
import {
  type Insight,
  type LeadRecord,
  type Locale,
  type SiteSettings,
  type SiteSnapshot,
  type Venture,
  homepageSectionSchema,
  insightSchema,
  leadRecordSchema,
  mediaAssetSchema,
  publicationSchema,
  siteSettingsSchema,
  timelineEntrySchema,
  ventureSchema
} from "@/lib/site-types";
import { createPublicSupabaseClient, createServiceRoleSupabaseClient, type GenericRow } from "@/lib/supabase";

function normalizeCollection<T>(rows: GenericRow[] | null, schema: { parse: (value: unknown) => T }, fallback: T[]): T[] {
  if (!rows || rows.length === 0) {
    return fallback;
  }

  try {
    return rows
      .map((row) => schema.parse(row.payload))
      .filter(Boolean) as T[];
  } catch {
    return fallback;
  }
}

async function fetchSingleton(table: "site_settings", useServiceRole = false): Promise<SiteSettings> {
  const client = useServiceRole ? createServiceRoleSupabaseClient() : createPublicSupabaseClient();
  const { data } = await client.from(table).select("payload").eq("key", "primary").maybeSingle();

  if (!data?.payload) {
    return defaultSiteSettings;
  }

  try {
    return siteSettingsSchema.parse(data.payload);
  } catch {
    return defaultSiteSettings;
  }
}

async function fetchCollection(
  table: "homepage_sections" | "ventures" | "timeline_entries" | "publications" | "insights" | "media_assets",
  useServiceRole = false
) {
  const client = useServiceRole ? createServiceRoleSupabaseClient() : createPublicSupabaseClient();
  const query = client.from(table).select("*").order("order_index", { ascending: true });
  const { data } = useServiceRole ? await query : await query.eq("published", true);
  return (data as GenericRow[] | null) ?? null;
}

export async function getPublicSiteSnapshot(): Promise<SiteSnapshot> {
  const [settings, sectionsRows, venturesRows, timelineRows, publicationsRows, insightsRows, mediaRows] =
    await Promise.all([
      fetchSingleton("site_settings"),
      fetchCollection("homepage_sections"),
      fetchCollection("ventures"),
      fetchCollection("timeline_entries"),
      fetchCollection("publications"),
      fetchCollection("insights"),
      fetchCollection("media_assets")
    ]);

  return {
    settings,
    sections: normalizeCollection(sectionsRows, homepageSectionSchema, defaultSiteSnapshot.sections),
    ventures: normalizeCollection(venturesRows, ventureSchema, defaultSiteSnapshot.ventures),
    timeline: normalizeCollection(timelineRows, timelineEntrySchema, defaultSiteSnapshot.timeline),
    publications: normalizeCollection(publicationsRows, publicationSchema, defaultSiteSnapshot.publications),
    insights: normalizeCollection(insightsRows, insightSchema, defaultSiteSnapshot.insights),
    mediaAssets: normalizeCollection(mediaRows, mediaAssetSchema, defaultSiteSnapshot.mediaAssets)
  };
}

export async function getAdminSnapshot() {
  const [settings, sectionsRows, venturesRows, timelineRows, publicationsRows, insightsRows, mediaRows, leadsRows] =
    await Promise.all([
      fetchSingleton("site_settings", true),
      fetchCollection("homepage_sections", true),
      fetchCollection("ventures", true),
      fetchCollection("timeline_entries", true),
      fetchCollection("publications", true),
      fetchCollection("insights", true),
      fetchCollection("media_assets", true),
      getLeadSubmissions()
    ]);

  return {
    settings,
    sections: normalizeCollection(sectionsRows, homepageSectionSchema, defaultSiteSnapshot.sections),
    ventures: normalizeCollection(venturesRows, ventureSchema, defaultSiteSnapshot.ventures),
    timeline: normalizeCollection(timelineRows, timelineEntrySchema, defaultSiteSnapshot.timeline),
    publications: normalizeCollection(publicationsRows, publicationSchema, defaultSiteSnapshot.publications),
    insights: normalizeCollection(insightsRows, insightSchema, defaultSiteSnapshot.insights),
    mediaAssets: normalizeCollection(mediaRows, mediaAssetSchema, defaultSiteSnapshot.mediaAssets),
    leads: leadsRows
  };
}

export async function getInsightBySlug(slug: string) {
  const snapshot = await getPublicSiteSnapshot();
  return snapshot.insights.find((item) => item.slug === slug) ?? null;
}

export async function getVentureBySlug(slug: string) {
  const snapshot = await getPublicSiteSnapshot();
  return snapshot.ventures.find((item) => item.slug === slug) ?? null;
}

export async function createLead(input: Omit<LeadRecord, "id" | "status" | "createdAt">) {
  const client = createServiceRoleSupabaseClient();
  const payload = {
    lead_type: input.leadType,
    name: input.name,
    email: input.email,
    company: input.company,
    message: input.message,
    locale: input.locale,
    status: "new"
  };
  return client.from("lead_submissions").insert(payload).select("*").single();
}

export async function getLeadSubmissions(): Promise<LeadRecord[]> {
  const client = createServiceRoleSupabaseClient();
  const { data } = await client
    .from("lead_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) {
    return [];
  }

  return data
    .map((row) =>
      leadRecordSchema.safeParse({
        id: row.id ?? randomUUID(),
        leadType: row.lead_type,
        name: row.name,
        email: row.email,
        company: row.company ?? "",
        message: row.message,
        locale: getLocale(row.locale),
        status: row.status,
        createdAt: row.created_at
      })
    )
    .filter((result) => result.success)
    .map((result) => result.data);
}

export async function updateLeadStatus(id: string, status: LeadRecord["status"]) {
  const client = createServiceRoleSupabaseClient();
  return client.from("lead_submissions").update({ status }).eq("id", id);
}

export function filterFeaturedVentures(ventures: Venture[]) {
  return ventures.filter((venture) => venture.featured).slice(0, 3);
}

export function filterPublishedInsights(insights: Insight[]) {
  return insights.filter((item) => item.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getLocaleFromParams(input?: string | string[] | null): Locale {
  return getLocale(Array.isArray(input) ? input[0] : input);
}
