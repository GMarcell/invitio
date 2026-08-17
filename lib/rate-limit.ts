// DB-backed rate limiting for guest-facing and auth actions.
//
// Uses the RateLimit table (a sliding-window counter per key) so limits
// survive server restarts and work across multiple instances — unlike an
// in-memory map. Keys are scoped strings like "login:<ip>" or
// "rsvp:<invitationId>:<ip>".

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  rsvp: { limit: 10, windowMs: 15 * 60 * 1000 },
  guestbook: { limit: 5, windowMs: 60 * 60 * 1000 },
  photoUpload: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const;

export type RateLimitScope = keyof typeof RATE_LIMITS;

/** Best-effort client IP from proxy headers, falling back to a shared dev value. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Checks whether an action is within its rate limit for the given scope+key.
 * Returns { ok } or { ok: false, retryAfterSeconds } once the limit is hit.
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  identifier: string,
): Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }> {
  const { limit, windowMs } = RATE_LIMITS[scope];
  const key = `${scope}:${identifier}`;
  const now = new Date();

  // Fresh window: start a counter.
  const existing = await prisma.rateLimit.findUnique({ where: { key } });
  if (!existing) {
    await prisma.rateLimit.create({ data: { key, windowStart: now, count: 1 } });
    return { ok: true };
  }

  // Window expired: reset and allow.
  if (now.getTime() - existing.windowStart.getTime() >= windowMs) {
    await prisma.rateLimit.update({ where: { key }, data: { windowStart: now, count: 1 } });
    return { ok: true };
  }

  // Within window: reject if at/over the limit, else increment.
  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.windowStart.getTime() + windowMs - now.getTime()) / 1000),
    );
    return { ok: false, retryAfterSeconds };
  }

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { ok: true };
}

/** Human-friendly retry message for errors surfaced to users. */
export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/** Deletes counters older than maxAgeMs — call from the cron job periodically. */
export async function pruneRateLimits(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMs);
  const res = await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: cutoff } } });
  return res.count;
}
