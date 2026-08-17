import { timingSafeEqual } from "node:crypto";
import { processScheduledReminders } from "@/lib/reminders";
import { pruneRateLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const provided = header.slice("Bearer ".length);
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Cron endpoint for scheduled RSVP reminders. Call this on a schedule from any
 * cron service (Vercel Cron, cron-job.org, GitHub Actions, system cron):
 *
 *   curl -X POST https://your-app.com/api/cron/reminders \
 *        -H "Authorization: Bearer $CRON_SECRET"
 *
 * It's idempotent — guests are only emailed once (reminderSentAt).
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await processScheduledReminders();
  // Housekeeping: drop rate-limit counters older than a week.
  const pruned = await pruneRateLimits();
  return Response.json({ ok: true, ...result, prunedRateLimits: pruned });
}

export async function POST(request: Request) {
  return GET(request);
}
