import { processScheduledReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
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
  return Response.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return GET(request);
}
