import { describe, expect, it, vi } from "vitest";

const cookieStore = new Map<string, string>();
const redirectMock = vi.fn();

vi.mock("@/lib/env", () => ({
  getEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
    DATABASE_URL: "postgresql://postgres:pass@example.com:5432/postgres",
    ADMIN_PASS: "Burak-admin-2026",
    ADMIN_SESSION_SECRET: "12345678901234567890"
  })
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (name: string, value: string) => {
      cookieStore.set(name, value);
    },
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value ? { value } : undefined;
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    }
  })
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

describe("admin auth helpers", async () => {
  const {
    clearAdminSessionCookie,
    createAdminSessionToken,
    isAdminAuthenticated,
    isValidAdminPassword,
    requireAdminPage,
    setAdminSessionCookie,
    verifyAdminSessionToken
  } = await import("@/lib/auth");

  it("creates a verifiable session token", () => {
    const token = createAdminSessionToken(1_000);
    expect(verifyAdminSessionToken(token, 2_000)).toBe(true);
    expect(verifyAdminSessionToken(token, 1000 * 60 * 60 * 24)).toBe(false);
    expect(verifyAdminSessionToken("bad.token", 2_000)).toBe(false);
  });

  it("checks the configured admin password", () => {
    expect(isValidAdminPassword("Burak-admin-2026")).toBe(true);
    expect(isValidAdminPassword("wrong")).toBe(false);
  });

  it("sets and clears the admin session cookie", async () => {
    cookieStore.clear();
    await setAdminSessionCookie();
    expect(cookieStore.has("burak-admin-session")).toBe(true);
    expect(await isAdminAuthenticated()).toBe(true);
    await clearAdminSessionCookie();
    expect(await isAdminAuthenticated()).toBe(false);
  });

  it("redirects unauthenticated admin page access", async () => {
    cookieStore.clear();
    redirectMock.mockClear();
    await requireAdminPage();
    expect(redirectMock).toHaveBeenCalledWith("/admin/login");
  });
});
