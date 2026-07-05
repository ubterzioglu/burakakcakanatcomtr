import { z } from "zod";

export const localeSchema = z.enum(["tr", "en"]);
export type Locale = z.infer<typeof localeSchema>;

export const localizedTextSchema = z.object({
  tr: z.string().min(1),
  en: z.string().min(1)
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const statSchema = z.object({
  label: localizedTextSchema,
  value: z.string().min(1)
});
export type Stat = z.infer<typeof statSchema>;

export const ctaSchema = z.object({
  label: localizedTextSchema,
  href: z.string().min(1)
});
export type Cta = z.infer<typeof ctaSchema>;

export const siteSettingsSchema = z.object({
  domain: z.string().min(1),
  seoTitle: localizedTextSchema,
  seoDescription: localizedTextSchema,
  heroEyebrow: localizedTextSchema,
  heroTitle: localizedTextSchema,
  heroBody: localizedTextSchema,
  heroRibbon: localizedTextSchema,
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  tertiaryCta: ctaSchema,
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  baseLocation: localizedTextSchema,
  socialLinks: z.object({
    linkedin: z.string().url(),
    qualtron: z.string().url(),
    corteqs: z.string().url(),
    payal: z.string().url().optional(),
    hcd: z.string().url()
  }),
  globalStats: z.array(statSchema).min(3),
  trustBadges: z.array(localizedTextSchema).min(3)
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const homepageSectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  published: z.boolean().default(true),
  eyebrow: localizedTextSchema,
  title: localizedTextSchema,
  body: localizedTextSchema,
  callout: localizedTextSchema.optional(),
  bullets: z.array(localizedTextSchema).default([])
});
export type HomepageSection = z.infer<typeof homepageSectionSchema>;

export const ventureSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  name: z.string().min(1),
  category: localizedTextSchema,
  summary: localizedTextSchema,
  description: localizedTextSchema,
  url: z.string().url().optional(),
  accent: z.string().min(1),
  marketFocus: z.array(localizedTextSchema).min(1),
  metrics: z.array(statSchema).default([])
});
export type Venture = z.infer<typeof ventureSchema>;

export const timelineEntrySchema = z.object({
  id: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  published: z.boolean().default(true),
  period: localizedTextSchema,
  title: localizedTextSchema,
  org: z.string().min(1),
  body: localizedTextSchema
});
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

export const publicationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  published: z.boolean().default(true),
  title: localizedTextSchema,
  subtitle: localizedTextSchema,
  url: z.string().url(),
  kind: localizedTextSchema
});
export type Publication = z.infer<typeof publicationSchema>;

export const insightSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  published: z.boolean().default(true),
  publishedAt: z.string().min(1),
  title: localizedTextSchema,
  excerpt: localizedTextSchema,
  body: localizedTextSchema,
  tags: z.array(z.string()).default([])
});
export type Insight = z.infer<typeof insightSchema>;

export const mediaAssetSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  orderIndex: z.number().int().nonnegative(),
  published: z.boolean().default(true),
  title: localizedTextSchema,
  url: z.string().url(),
  kind: z.enum(["image", "logo", "document", "video"]),
  alt: localizedTextSchema
});
export type MediaAsset = z.infer<typeof mediaAssetSchema>;

export const leadSubmissionSchema = z.object({
  leadType: z.enum(["partner", "investor", "consulting", "community"]),
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional().default(""),
  message: z.string().min(10),
  locale: localeSchema
});
export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

export const leadStatusSchema = z.enum(["new", "reviewing", "contacted", "qualified", "closed"]);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const leadRecordSchema = leadSubmissionSchema.extend({
  id: z.string().min(1),
  status: leadStatusSchema,
  createdAt: z.string().min(1)
});
export type LeadRecord = z.infer<typeof leadRecordSchema>;

export type SiteSnapshot = {
  settings: SiteSettings;
  sections: HomepageSection[];
  ventures: Venture[];
  timeline: TimelineEntry[];
  publications: Publication[];
  insights: Insight[];
  mediaAssets: MediaAsset[];
};
