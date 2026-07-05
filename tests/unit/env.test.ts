import { describe, expect, it } from "vitest";

import { getEnv, normalizeEnv } from "@/lib/env";

describe("normalizeEnv", () => {
  it("accepts the named environment variables shape", () => {
    const env = normalizeEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      DATABASE_URL: "postgresql://postgres:pass@example.com:5432/postgres",
      ADMIN_PASS: "strong-password",
      ADMIN_SESSION_SECRET: "1234567890123456"
    });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toContain("supabase.co");
  });

  it("rejects missing required variables", () => {
    expect(() =>
      normalizeEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
      })
    ).toThrow();
  });

  it("reads the process environment through getEnv", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.DATABASE_URL = "postgresql://postgres:pass@example.com:5432/postgres";
    process.env.ADMIN_PASS = "strong-password";
    process.env.ADMIN_SESSION_SECRET = "1234567890123456";

    expect(getEnv().ADMIN_PASS).toBe("strong-password");
  });
});
