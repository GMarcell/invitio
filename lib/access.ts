// Access-code grant cookie.
//
// Guests who enter the correct access code get a cookie listing which
// invitations they may view. Values are HMAC-signed so a visitor can't forge
// access by writing a slug into the cookie themselves.
//
// Cookie format: comma-separated `slug.signature` pairs, where
// signature = HMAC-SHA256(AUTH_SECRET, slug). AUTH_SECRET is already required
// by NextAuth, so no extra configuration is needed.

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ACCESS_COOKIE = "invitio_access";
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function signingKey(): string {
  // AUTH_SECRET is mandatory for NextAuth; this fallback only matters in
  // misconfigured environments and keeps the check deterministic.
  return process.env.AUTH_SECRET ?? "invitio-dev-access-secret";
}

function sign(slug: string): string {
  return createHmac("sha256", signingKey()).update(slug).digest("base64url");
}

function verify(pair: string): string | null {
  const dot = pair.lastIndexOf(".");
  if (dot <= 0) return null;
  const slug = pair.slice(0, dot);
  const sig = pair.slice(dot + 1);
  const expected = Buffer.from(sign(slug));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length) return null;
  return timingSafeEqual(expected, actual) ? slug : null;
}

function readGrants(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map(verify)
    .filter((s): s is string => s !== null);
}

export async function hasAccessToSlug(slug: string): Promise<boolean> {
  const store = await cookies();
  return readGrants(store.get(ACCESS_COOKIE)?.value).includes(slug);
}

export async function grantAccessToSlug(slug: string): Promise<void> {
  const store = await cookies();
  const current = readGrants(store.get(ACCESS_COOKIE)?.value);
  if (!current.includes(slug)) {
    current.push(slug);
    store.set(
      ACCESS_COOKIE,
      current.map((s) => `${s}.${sign(s)}`).join(","),
      {
        httpOnly: true,
        sameSite: "lax",
        maxAge: ACCESS_COOKIE_MAX_AGE,
        path: "/",
      },
    );
  }
}
