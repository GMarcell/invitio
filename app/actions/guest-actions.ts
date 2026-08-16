"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hostRsvpNotificationHtml, rsvpConfirmationHtml, sendEmail } from "@/lib/mailer";

const rsvpSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["yes", "no", "maybe"]),
  guestCount: z.coerce.number().int().min(1).max(20).default(1),
  mealChoice: z.string().max(120).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
  answers: z.record(z.string(), z.string()).optional(),
});

export async function submitRsvp(invitationId: string, raw: unknown) {
  const parsed = rsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const data = parsed.data;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, slug: true, title: true, owner: { select: { email: true } } },
  });
  if (!invitation) return { error: "Invitation not found." };

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

  // Notifications (dry-run to console without RESEND_API_KEY)
  if (email) {
    void sendEmail({
      to: email,
      subject: `RSVP received — ${invitation.title}`,
      html: rsvpConfirmationHtml(invitation.title, data.status),
    });
  }
  if (invitation.owner.email) {
    void sendEmail({
      to: invitation.owner.email,
      subject: `New RSVP — ${invitation.title}`,
      html: hostRsvpNotificationHtml(invitation.title, name, data.status),
    });
  }

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

const ACCESS_COOKIE = "invitio_access";

function readAccessCookie(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

export async function verifyAccessCode(slug: string, code: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { accessCode: true, status: true },
  });
  if (!invitation) return { error: "Invitation not found." };
  if (!invitation.accessCode) return { ok: true };
  if (invitation.accessCode !== code.trim()) return { error: "Incorrect code." };

  const store = await cookies();
  const current = readAccessCookie(store.get(ACCESS_COOKIE)?.value);
  if (!current.includes(slug)) {
    current.push(slug);
    store.set(ACCESS_COOKIE, current.join(","), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  revalidatePath(`/i/${slug}`);
  return { ok: true };
}

export async function hasAccessToSlug(slug: string): Promise<boolean> {
  const store = await cookies();
  return readAccessCookie(store.get(ACCESS_COOKIE)?.value).includes(slug);
}
