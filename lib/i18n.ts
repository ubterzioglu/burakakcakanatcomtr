import { localeSchema, type Locale, type LocalizedText } from "@/lib/site-types";

export function getLocale(input?: string | null): Locale {
  const parsed = localeSchema.safeParse(input);
  return parsed.success ? parsed.data : "en";
}

export function t(value: LocalizedText, locale: Locale) {
  return value[locale];
}
