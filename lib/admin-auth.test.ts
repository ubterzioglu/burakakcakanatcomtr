import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const COOKIE_STORE = new Map<string, { value: string }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => COOKIE_STORE.get(name),
    set: (name: string, value: string) => {
      COOKIE_STORE.set(name, { value });
    }
  })
}));

describe("bakcakanat auth", () => {
  const ORIGINAL_ENV = process.env.BAKCAKANAT_PASSWORD;

  beforeEach(() => {
    COOKIE_STORE.clear();
    process.env.BAKCAKANAT_PASSWORD = "test-password-123";
  });

  afterEach(() => {
    process.env.BAKCAKANAT_PASSWORD = ORIGINAL_ENV;
  });

  it("rejects sign-in with the wrong password", async () => {
    const { signInBakcakanat } = await import("./admin-auth");
    const ok = await signInBakcakanat("wrong-password");
    expect(ok).toBe(false);
  });

  it("accepts sign-in with the correct password and authenticates after", async () => {
    const { signInBakcakanat, isBakcakanatAuthenticated } = await import(
      "./admin-auth"
    );
    const ok = await signInBakcakanat("test-password-123");
    expect(ok).toBe(true);
    expect(await isBakcakanatAuthenticated()).toBe(true);
  });

  it("fails closed when BAKCAKANAT_PASSWORD is not configured", async () => {
    process.env.BAKCAKANAT_PASSWORD = "";
    const { signInBakcakanat, isBakcakanatAuthenticated } = await import(
      "./admin-auth"
    );
    expect(await signInBakcakanat("anything")).toBe(false);
    expect(await isBakcakanatAuthenticated()).toBe(false);
  });

  it("signs out by clearing the cookie", async () => {
    const { signInBakcakanat, signOutBakcakanat, isBakcakanatAuthenticated } =
      await import("./admin-auth");
    await signInBakcakanat("test-password-123");
    expect(await isBakcakanatAuthenticated()).toBe(true);
    await signOutBakcakanat();
    expect(await isBakcakanatAuthenticated()).toBe(false);
  });
});
