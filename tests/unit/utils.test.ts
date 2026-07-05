import { describe, expect, it } from "vitest";

import { cn, formatDateLabel, slugify } from "@/lib/utils";

describe("utility helpers", () => {
  it("creates URL-friendly slugs", () => {
    expect(slugify("Human Consciousness Decoded")).toBe("human-consciousness-decoded");
  });

  it("formats dates for Turkish and English locales", () => {
    expect(formatDateLabel("2026-07-05", "en")).toContain("2026");
    expect(formatDateLabel("2026-07-05", "tr")).toContain("2026");
  });

  it("merges classes with cn", () => {
    expect(cn("alpha", false && "beta", "gamma")).toBe("alpha gamma");
  });
});
