"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hostRsvpNotificationHtml, rsvpConfirmationHtml, sendEmail } from "@/lib/mailer";
import { grantAccessToSlug } from "@/lib/access";
import { checkRateLimit, clientIp, rateLimitMessage } from "@/lib/rate-limit";

const rsvpSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["yes", "no", "maybe"]),
  guestCount: z.coerce.number().int().min(1).max(20).default(1),
  mealChoice: z.string().max(120).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
  // Custom-question answers: cap both the number of questions and each answer
  // length so a guest can't store arbitrarily large payloads.
  answers: z
    .record(z.string().max(200), z.string().max(1000))
    .refine((a) => Object.keys(a).length <= 20, { message: "Too many answers." })
    .optional(),
});

export async function submitRsvp(invitationId: string, raw: unknown) {
  const parsed = rsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const data = parsed.data;

  // Throttle RSVP spam per invitation + visitor before touching the database.
  const ip = await clientIp();
  const limit = await checkRateLimit("rsvp", `${invitationId}:${ip}`);
  if (!limit.ok) return { error: rateLimitMessage(limit.retryAfterSeconds) };

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, slug: true, title: true, status: true, rsvpDeadline: true, owner: { select: { email: true } } },
  });
  if (!invitation) return { error: "Invitation not found." };

  // Only published, upcoming invitations accept RSVPs (drafts and past events
  // 404 on the page already; this guards direct calls), and submissions after
  // the RSVP deadline are rejected so late responses can't skew the guest list.
  if (invitation.status !== "active") {
    return { error: "This invitation isn't open for RSVPs right now." };
  }
  if (invitation.rsvpDeadline && new Date() > invitation.rsvpDeadline) {
    return { error: "The RSVP deadline has passed." };
  }

  const name = data.name.trim();
  const phone = data.phone?.trim() || null;
  const email = data.email?.trim() || null;

  // Basic spam/duplicate prevention: match by normalized name + phone, and update instead of duplicating.
  const existing = phone
    ? await prisma.rsvp.findFirst({
        where: {
          invitationId,
          phone,
          name: { equals: name, mode: "insensitive" },
        },
      })
    : await prisma.rsvp.findFirst({
        where: {
          invitationId,
          name: { equals: name, mode: "insensitive" },
          email,
        },
      });

  let rsvp;
  if (existing) {
    rsvp = await prisma.rsvp.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        guestCount: data.guestCount,
        mealChoice: data.mealChoice || null,
        note: data.note || null,
        email: email ?? existing.email,
        phone: phone ?? existing.phone,
        answers: data.answers as object,
      },
    });
  } else {
    rsvp = await prisma.rsvp.create({
      data: {
        invitationId,
        name,
        email,
        phone,
        status: data.status,
        guestCount: data.guestCount,
        mealChoice: data.mealChoice || null,
        note: data.note || null,
        answers: data.answers as object,
      },
    });

    // Link to an imported guest if one matches.
    const guest = await prisma.guest.findFirst({
      where: {
        invitationId,
        rsvpId: null,
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
          { name: { equals: name, mode: "insensitive" } },
        ],
      },
    });
    if (guest) {
      await prisma.guest.update({ where: { id: guest.id }, data: { rsvpId: rsvp.id } });
    }
  }

  // Notifications (dry-run to console without RESEND_API_KEY). Await both so
  // the emails are actually sent before the request completes (fire-and-forget
  // can be cut short by the serverless runtime).
  const sends: Promise<unknown>[] = [];
  if (email) {
    sends.push(
      sendEmail({
        to: email,
        subject: `RSVP received — ${invitation.title}`,
        html: rsvpConfirmationHtml(invitation.title, data.status),
      }),
    );
  }
  if (invitation.owner.email) {
    sends.push(
      sendEmail({
        to: invitation.owner.email,
        subject: `New RSVP — ${invitation.title}`,
        html: hostRsvpNotificationHtml(invitation.title, name, data.status),
      }),
    );
  }
  await Promise.allSettled(sends);

  revalidatePath(`/i/${invitation.slug}`);
  return { ok: true };
}

const messageSchema = z.object({
  name: z.string().min(1).max(120),
  message: z.string().min(1).max(1000),
});

export async function addGuestbookMessage(invitationId: string, raw: unknown) {
  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please enter your name and a message." };

  // Throttle guestbook spam per invitation + visitor.
  const ip = await clientIp();
  const limit = await checkRateLimit("guestbook", `${invitationId}:${ip}`);
  if (!limit.ok) return { error: rateLimitMessage(limit.retryAfterSeconds) };

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { slug: true },
  });
  if (!invitation) return { error: "Invitation not found." };

  await prisma.guestbookMessage.create({
    data: {
      invitationId,
      name: parsed.data.name.trim(),
      message: parsed.data.message.trim(),
    },
  });

  revalidatePath(`/i/${invitation.slug}`);
  return { ok: true };
}

export async function verifyAccessCode(slug: string, code: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { accessCode: true, status: true },
  });
  if (!invitation) return { error: "Invitation not found." };
  if (!invitation.accessCode) return { ok: true };
  if (invitation.accessCode !== code.trim()) return { error: "Incorrect code." };

  await grantAccessToSlug(slug);
  revalidatePath(`/i/${slug}`);
  return { ok: true };
}
