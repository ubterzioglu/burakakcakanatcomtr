import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminEnv } from "@/lib/env";

const COOKIE_NAME = "burak-admin-session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSigningSecret() {
  const env = getAdminEnv();
  return env.ADMIN_SESSION_SECRET ?? `${env.ADMIN_PASS}:${env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 24)}`;
}

function sign(payload: string) {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
}

export function createAdminSessionToken(now = Date.now()) {
  const payload = JSON.stringify({
    exp: now + SESSION_TTL_MS,
    iat: now
  });

  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminSessionToken(token?: string | null, now = Date.now()) {
  if (!token) {
    return false;
  }

  const [encoded, providedSignature] = token.split(".");
  if (!encoded || !providedSignature) {
    return false;
  }

  const expectedSignature = sign(encoded);
  const provided = Buffer.from(providedSignature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  if (!timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      exp: number;
    };

    return payload.exp > now;
  } catch {
    return false;
  }
}

export function isValidAdminPassword(candidate: string) {
  return candidate === getAdminEnv().ADMIN_PASS;
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}
