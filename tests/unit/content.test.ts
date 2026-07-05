import { describe, expect, it } from "vitest";

import { defaultSiteSnapshot } from "@/lib/default-content";
import { getLocale, t } from "@/lib/i18n";
import { leadSubmissionSchema } from "@/lib/site-types";

describe("i18n helpers", () => {
  it("falls back to english for unsupported locales", () => {
    expect(getLocale("de")).toBe("en");
  });

  it("returns localized copy for the given locale", () => {
    expect(t(defaultSiteSnapshot.settings.heroTitle, "tr")).toContain("Kuruculuk");
    expect(t(defaultSiteSnapshot.settings.heroTitle, "en")).toContain("leadership");
  });
});

describe("lead submission schema", () => {
  it("accepts a valid lead payload", () => {
    const payload = leadSubmissionSchema.parse({
      leadType: "partner",
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      message: "We would like to discuss a strategic collaboration in the GCC.",
      locale: "en"
    });

    expect(payload.leadType).toBe("partner");
  });

  it("rejects too-short messages", () => {
    expect(() =>
      leadSubmissionSchema.parse({
        leadType: "partner",
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: "Analytical Engines",
        message: "short",
        locale: "en"
      })
    ).toThrow();
  });
});
