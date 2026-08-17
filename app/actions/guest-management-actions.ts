"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireEditAccess } from "@/lib/auth-helpers";
import { sendRemindersForInvitation } from "@/lib/reminders";

export async function importGuests(invitationId: string, rawRows: unknown) {
  await requireEditAccess(invitationId);

  const rows = z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        email: z.string().max(200).optional().nullable(),
        phone: z.string().max(60).optional().nullable(),
      }),
    )
    .max(2000)
    .safeParse(rawRows);

  if (!rows.success) return { error: "Invalid guest data. Expected name, email and phone columns." };

  const valid = rows.data.filter((r) => r.name.trim());
  if (valid.length === 0) return { error: "No valid rows found." };

  const existing = await prisma.guest.findMany({
    where: { invitationId },
    select: { email: true, phone: true, name: true },
  });

  const existingKeys = new Set(
    existing.map((g) => `${(g.email ?? "").toLowerCase()}|${g.phone ?? ""}|${g.name.toLowerCase()}`),
  );

  const toCreate = valid.filter((r) => {
    const key = `${(r.email ?? "").toLowerCase()}|${r.phone ?? ""}|${r.name.toLowerCase()}`;
    if (existingKeys.has(key)) return false;
    existingKeys.add(key);
    return true;
  });

  if (toCreate.length > 0) {
    await prisma.guest.createMany({
      data: toCreate.map((r) => ({
        invitationId,
        name: r.name.trim(),
        email: r.email?.trim() || null,
        phone: r.phone?.trim() || null,
        source: "import",
      })),
    });
  }

  revalidatePath(`/invitations/${invitationId}/guests`);
  return { ok: true, imported: toCreate.length, skipped: valid.length - toCreate.length };
}

export async function addGuestManually(invitationId: string, raw: unknown) {
  await requireEditAccess(invitationId);
  const parsed = z
    .object({
      name: z.string().min(1).max(200),
      email: z.string().max(200).optional().nullable(),
      phone: z.string().max(60).optional().nullable(),
    })
    .safeParse(raw);
  if (!parsed.success) return { error: "Please enter a guest name." };

  await prisma.guest.create({
    data: {
      invitationId,
      name: parsed.data.name.trim(),
      email: parsed.data.email?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
    },
  });
  revalidatePath(`/invitations/${invitationId}/guests`);
  return { ok: true };
}

export async function sendRemindersNow(invitationId: string) {
  await requireEditAccess(invitationId);
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, title: true, slug: true, rsvpDeadline: true, eventDate: true },
  });
  if (!invitation) return { error: "Invitation not found." };
  if (!invitation.rsvpDeadline) {
    return { error: "Set an RSVP deadline on the invitation before sending reminders." };
  }
  const sent = await sendRemindersForInvitation(invitation);
  revalidatePath(`/invitations/${invitationId}/guests`);
  return { ok: true, sent };
}

export async function deleteGuest(invitationId: string, guestId: string) {
  await requireEditAccess(invitationId);
  // Scope the delete to this invitation so a record from another invitation
  // can't be removed by id (IDOR).
  await prisma.guest.deleteMany({ where: { id: guestId, invitationId } });
  revalidatePath(`/invitations/${invitationId}/guests`);
}

export async function deleteRsvp(invitationId: string, rsvpId: string) {
  await requireEditAccess(invitationId);
  await prisma.rsvp.deleteMany({ where: { id: rsvpId, invitationId } });
  revalidatePath(`/invitations/${invitationId}/guests`);
}

export async function deleteMessage(invitationId: string, messageId: string) {
  await requireEditAccess(invitationId);
  await prisma.guestbookMessage.deleteMany({ where: { id: messageId, invitationId } });
  revalidatePath(`/invitations/${invitationId}/guests`);
}

// ── Gifts ───────────────────────────────────────────────────

const giftSchema = z.object({
  giverName: z.string().min(1).max(200),
  type: z.enum(["cash", "physical", "other"]),
  amount: z.coerce.number().finite().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  notes: z.string().max(500).optional(),
});

export async function addGift(invitationId: string, raw: unknown) {
  await requireEditAccess(invitationId);
  const parsed = giftSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please enter the giver's name." };

  await prisma.gift.create({
    data: {
      invitationId,
      giverName: parsed.data.giverName.trim(),
      type: parsed.data.type,
      amount: parsed.data.amount ?? null,
      currency: parsed.data.currency || "USD",
      notes: parsed.data.notes || null,
    },
  });
  revalidatePath(`/invitations/${invitationId}/guests`);
  return { ok: true };
}

export async function updateGift(giftId: string, data: { thankYouSent?: boolean; type?: string }) {
  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) return;
  await requireEditAccess(gift.invitationId);
  await prisma.gift.update({ where: { id: giftId }, data });
  revalidatePath(`/invitations/${gift.invitationId}/guests`);
}

export async function deleteGift(giftId: string) {
  const gift = await prisma.gift.findUnique({ where: { id: giftId } });
  if (!gift) return;
  await requireEditAccess(gift.invitationId);
  await prisma.gift.delete({ where: { id: giftId } });
  revalidatePath(`/invitations/${gift.invitationId}/guests`);
}
