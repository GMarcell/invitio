"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireEditAccess, requireUser } from "@/lib/auth-helpers";
import { type TemplateTheme } from "@/lib/templates";
import { randomSuffix, slugify } from "@/lib/utils";

const themeSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    bg: z.string(),
    surface: z.string(),
    text: z.string(),
    muted: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    script: z.string().optional(),
  }),
});

const questionSchema = z.object({
  id: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
});

const updateInvitationSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  category: z.string(),
  eventDate: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  locationLink: z.string().max(1000).nullable().optional(),
  dressCode: z.string().max(120).nullable().optional(),
  rsvpDeadline: z.string().nullable().optional(),
  accessCode: z.string().max(30).nullable().optional(),
  defaultLanguage: z.enum(["en", "id"]),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and dashes."),
  theme: themeSchema,
  showCountdown: z.boolean(),
  showCalendar: z.boolean(),
  showGuestbook: z.boolean(),
  showGift: z.boolean(),
  hasMealOption: z.boolean(),
  mealOptions: z.array(z.string()),
  customQuestions: z.array(questionSchema),
  enableReminders: z.boolean(),
  reminderOffsetDays: z.number().int().min(1).max(60),
  status: z.enum(["draft", "active", "past"]),
});

export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base) || "invitation";
  let i = 0;
  while (true) {
    const existing = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${slugify(base)}-${randomSuffix(4)}`;
    if (++i > 5) break;
  }
  return slug;
}

export async function createInvitation(templateId: string) {
  const user = await requireUser();

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) redirect("/templates");

  const theme = template.theme as TemplateTheme;
  const baseSlug = slugify(`${template.name} ${randomSuffix(3)}`);
  const slug = await uniqueSlug(baseSlug);

  const invitation = await prisma.invitation.create({
    data: {
      slug,
      title: template.name,
      subtitle: "You are invited",
      category: template.category,
      templateId: template.id,
      ownerId: user.id,
      status: "draft",
      theme: {
        colors: theme.colors,
        fonts: theme.fonts,
      } as object,
    },
  });

  redirect(`/invitations/${invitation.id}/edit`);
}

export async function updateInvitation(id: string, raw: UpdateInvitationInput) {
  await requireEditAccess(id);

  const parsed = updateInvitationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const slug = await uniqueSlug(data.slug, id);

  await prisma.invitation.update({
    where: { id },
    data: {
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description ?? null,
      category: data.category,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
      timezone: data.timezone ?? "Asia/Jakarta",
      location: data.location ?? null,
      locationLink: data.locationLink ?? null,
      dressCode: data.dressCode ?? null,
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : null,
      accessCode: data.accessCode?.trim() ? data.accessCode.trim() : null,
      defaultLanguage: data.defaultLanguage,
      slug,
      theme: data.theme as object,
      showCountdown: data.showCountdown,
      showCalendar: data.showCalendar,
      showGuestbook: data.showGuestbook,
      showGift: data.showGift,
      hasMealOption: data.hasMealOption,
      mealOptions: data.mealOptions as object,
      customQuestions: data.customQuestions as object,
      enableReminders: data.enableReminders,
      reminderOffsetDays: data.reminderOffsetDays,
      status: data.status,
    },
  });

  revalidatePath(`/invitations/${id}/edit`);
  revalidatePath(`/i/${slug}`);
  revalidatePath("/dashboard");
  return { ok: true, slug };
}

export async function deleteInvitation(id: string) {
  await requireEditAccess(id);
  await prisma.invitation.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/templates");
}

export async function duplicateInvitation(id: string) {
  const user = await requireUser();
  const source = await prisma.invitation.findUnique({
    where: { id },
    include: { giftAccounts: true },
  });
  if (!source || source.ownerId !== user.id) redirect("/dashboard");

  const slug = await uniqueSlug(`${source.title} copy`);

  const copy = await prisma.invitation.create({
    data: {
      slug,
      title: `${source.title} (Copy)`,
      subtitle: source.subtitle,
      description: source.description,
      category: source.category,
      eventDate: source.eventDate,
      timezone: source.timezone,
      location: source.location,
      locationLink: source.locationLink,
      dressCode: source.dressCode,
      rsvpDeadline: source.rsvpDeadline,
      templateId: source.templateId,
      ownerId: user.id,
      status: "draft",
      theme: source.theme as object,
      mealOptions: source.mealOptions as object,
      customQuestions: source.customQuestions as object,
      hasMealOption: source.hasMealOption,
      showCountdown: source.showCountdown,
      showCalendar: source.showCalendar,
      showGuestbook: source.showGuestbook,
      showGift: source.showGift,
      giftAccounts: {
        create: source.giftAccounts.map((g) => ({
          label: g.label,
          accountHolder: g.accountHolder,
          bankName: g.bankName,
          accountNumber: g.accountNumber,
          qrImage: g.qrImage,
          sortOrder: g.sortOrder,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/invitations/${copy.id}/edit`);
}

export async function setInvitationStatus(id: string, status: "active" | "draft" | "past") {
  await requireEditAccess(id);
  const inv = await prisma.invitation.update({
    where: { id },
    data: { status },
    select: { slug: true },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/i/${inv.slug}`);
}

// ── Gift accounts ─────────────────────────────────────────

const giftAccountSchema = z.object({
  label: z.string().min(1).max(60),
  accountHolder: z.string().min(1).max(120),
  bankName: z.string().max(60).nullable().optional(),
  accountNumber: z.string().min(1).max(60),
  qrImage: z.string().max(1000).nullable().optional(),
});

export async function addGiftAccount(id: string, raw: unknown) {
  await requireEditAccess(id);
  const parsed = giftAccountSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please fill in all gift account fields." };

  const count = await prisma.giftAccount.count({ where: { invitationId: id } });
  await prisma.giftAccount.create({
    data: {
      invitationId: id,
      label: parsed.data.label,
      accountHolder: parsed.data.accountHolder,
      bankName: parsed.data.bankName ?? null,
      accountNumber: parsed.data.accountNumber,
      qrImage: parsed.data.qrImage ?? null,
      sortOrder: count,
    },
  });
  revalidatePath(`/invitations/${id}/edit`);
  return { ok: true };
}

export async function updateGiftAccount(id: string, raw: unknown) {
  const account = await prisma.giftAccount.findUnique({ where: { id } });
  if (!account) return { error: "Account not found." };
  await requireEditAccess(account.invitationId);

  const parsed = giftAccountSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please fill in all gift account fields." };

  await prisma.giftAccount.update({
    where: { id },
    data: {
      label: parsed.data.label,
      accountHolder: parsed.data.accountHolder,
      bankName: parsed.data.bankName ?? null,
      accountNumber: parsed.data.accountNumber,
      qrImage: parsed.data.qrImage ?? null,
    },
  });
  revalidatePath(`/invitations/${account.invitationId}/edit`);
  return { ok: true };
}

export async function deleteGiftAccount(id: string) {
  const account = await prisma.giftAccount.findUnique({ where: { id } });
  if (!account) return;
  await requireEditAccess(account.invitationId);
  await prisma.giftAccount.delete({ where: { id } });
  revalidatePath(`/invitations/${account.invitationId}/edit`);
}

// ── Collaborators ─────────────────────────────────────────

export async function addCollaborator(invitationId: string, email: string) {
  await requireEditAccess(invitationId);
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { error: "Please enter a valid email." };

  const existing = await prisma.collaborator.findUnique({
    where: { invitationId_email: { invitationId, email: clean } },
  });
  if (existing) return { error: "That person is already a collaborator." };

  // Link to an existing account if present.
  const user = await prisma.user.findUnique({ where: { email: clean } });

  await prisma.collaborator.create({
    data: {
      invitationId,
      email: clean,
      userId: user?.id ?? null,
      status: user ? "accepted" : "pending",
    },
  });
  revalidatePath(`/invitations/${invitationId}/edit`);
  return { ok: true };
}

export async function removeCollaborator(collaboratorId: string) {
  const collab = await prisma.collaborator.findUnique({ where: { id: collaboratorId } });
  if (!collab) return;
  await requireEditAccess(collab.invitationId);
  await prisma.collaborator.delete({ where: { id: collaboratorId } });
  revalidatePath(`/invitations/${collab.invitationId}/edit`);
}
