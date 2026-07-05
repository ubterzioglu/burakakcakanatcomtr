import { describe, expect, it } from "vitest";

import { defaultHomepageSections, defaultInsights, defaultSiteSettings, defaultVentures } from "@/lib/default-content";
import {
  normalizeCollectionForStorage,
  parseCollectionPayload,
  parseSingletonPayload
} from "@/lib/resources";

describe("resource helpers", () => {
  it("parses singleton site settings payloads", () => {
    const parsed = parseSingletonPayload(defaultSiteSettings);
    expect(parsed.domain).toContain("burakakcakanat.com.tr");
  });

  it("parses collection payloads for homepage sections", () => {
    const parsed = parseCollectionPayload("homepage_sections", defaultHomepageSections);
    expect(parsed).toHaveLength(3);
  });

  it("normalizes collections for database storage", () => {
    const normalized = normalizeCollectionForStorage("homepage_sections", defaultHomepageSections);
    expect(normalized[0]).toMatchObject({
      slug: "manifesto",
      order_index: 0,
      published: true
    });
    expect(normalized[0].payload).toBeTruthy();
  });

  it("normalizes featured venture and insight-specific fields", () => {
    const ventures = normalizeCollectionForStorage("ventures", defaultVentures);
    const insights = normalizeCollectionForStorage("insights", defaultInsights);

    expect(ventures[0]?.featured).toBe(true);
    expect(insights[0]?.published_at).toBe("2026-07-01");
  });
});
