import { prisma } from "@/lib/prisma";
import { reminderEmailHtml, sendEmail } from "@/lib/mailer";

const DAY_MS = 24 * 60 * 60 * 1000;

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Guests who have an email on file, haven't responded yet, and haven't already
 * been sent a reminder. "Responded" matches the dashboard's definition: any RSVP
 * row with the same name (case-insensitive).
 */
export async function findPendingReminderTargets(invitationId: string) {
  const [guests, rsvps] = await Promise.all([
    prisma.guest.findMany({
      where: { invitationId, email: { not: null } },
    }),
    prisma.rsvp.findMany({
      where: { invitationId },
      select: { name: true },
    }),
  ]);

  const responded = new Set(rsvps.map((r) => r.name.toLowerCase().trim()));
  return guests.filter(
    (g) => g.email && !g.reminderSentAt && !responded.has(g.name.toLowerCase().trim()),
  );
}

export type ReminderInvitation = {
  id: string;
  title: string;
  slug: string;
  rsvpDeadline: Date | null;
  eventDate: Date | null;
};

/** Sends a reminder email to every pending guest with an email, marking each as reminded. Returns the count sent. */
export async function sendRemindersForInvitation(invitation: ReminderInvitation): Promise<number> {
  if (!invitation.rsvpDeadline) return 0;
  const targets = await findPendingReminderTargets(invitation.id);
  const link = `${baseUrl()}/i/${invitation.slug}`;

  let sent = 0;
  for (const guest of targets) {
    const result = await sendEmail({
      to: guest.email!,
      subject: `RSVP reminder — ${invitation.title}`,
      html: reminderEmailHtml({
        name: guest.name,
        title: invitation.title,
        link,
        deadline: invitation.rsvpDeadline,
      }),
    });
    if (result.ok) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    }
  }
  return sent;
}

/**
 * Cron entry point: finds active invitations whose reminder window has opened
 * (RSVP deadline minus reminderOffsetDays) and whose event hasn't passed, then
 * emails their pending guests. Safe to run repeatedly — guests are only emailed
 * once (reminderSentAt).
 */
export async function processScheduledReminders(): Promise<{ sent: number; invitations: number }> {
  const now = new Date();

  const invitations = await prisma.invitation.findMany({
    where: {
      status: "active",
      enableReminders: true,
      rsvpDeadline: { not: null },
      eventDate: { gt: now },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      rsvpDeadline: true,
      eventDate: true,
      reminderOffsetDays: true,
    },
  });

  let sent = 0;
  let processed = 0;

  for (const invitation of invitations) {
    const deadline = invitation.rsvpDeadline!;
    const windowStart = new Date(deadline.getTime() - invitation.reminderOffsetDays * DAY_MS);
    if (now >= windowStart) {
      sent += await sendRemindersForInvitation(invitation);
      processed++;
    }
  }

  console.log(
    `[reminders] processed ${processed} invitation(s), sent ${sent} reminder email(s). ` +
      `${invitations.length - processed} not yet in window.`,
  );
  return { sent, invitations: processed };
}
