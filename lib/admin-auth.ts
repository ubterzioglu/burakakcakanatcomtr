import { cookies } from "next/headers";

/**
 * The Akçakanat domain board (/bakcakanat) has its own password/cookie so it
 * can be shared independently of every other admin key.
 */
export const BAKCAKANAT_ACCESS_COOKIE = "ubt_bakcakanat_access";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Reads the Akçakanat domain-board password (empty string if not configured).
 * No fallback: the board is gated solely by BAKCAKANAT_PASSWORD.
 */
function getBakcakanatPassword(): string {
  return process.env.BAKCAKANAT_PASSWORD?.trim() ?? "";
}

/**
 * True when the current request carries a valid Akçakanat session cookie.
 *
 * Fails CLOSED: if BAKCAKANAT_PASSWORD is not configured (e.g. missing on the
 * production host), nobody gets in — the board must never be publicly
 * reachable just because an env var was forgotten.
 */
export async function isBakcakanatAuthenticated(): Promise<boolean> {
  const password = getBakcakanatPassword();
  if (!password) return false;
  const cookieStore = await cookies();
  const candidate = cookieStore.get(BAKCAKANAT_ACCESS_COOKIE)?.value ?? "";
  return candidate.trim() === password;
}

/**
 * Validates the supplied password and, when correct, persists it in an
 * HttpOnly cookie scoped to /bakcakanat. Returns whether sign-in succeeded.
 */
export async function signInBakcakanat(candidate: string): Promise<boolean> {
  const password = getBakcakanatPassword();
  // Fail closed: without a configured password no sign-in is possible.
  if (!password) return false;
  if (candidate.trim() !== password) return false;

  const cookieStore = await cookies();
  cookieStore.set(BAKCAKANAT_ACCESS_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/bakcakanat",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS
  });

  return true;
}

/**
 * Clears the Akçakanat session cookie (sign out).
 *
 * Expires the cookie with the exact attributes used at sign-in instead of
 * `cookies().delete()`: the plain deletion Set-Cookie carries no Secure/
 * HttpOnly/SameSite flags, and browsers can refuse to drop a Secure cookie
 * (set in production over HTTPS) without attribute parity.
 */
export async function signOutBakcakanat(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(BAKCAKANAT_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/bakcakanat",
    maxAge: 0
  });
}
