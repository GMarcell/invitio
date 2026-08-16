import { themeForInvitation, type TemplateTheme } from "@/lib/templates";

type PrismaInvite = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  eventDate: Date | null;
  timezone: string;
  location: string | null;
  locationLink: string | null;
  dressCode: string | null;
  rsvpDeadline: Date | null;
  accessCode: string | null;
  defaultLanguage: string;
  status: string;
  showCountdown: boolean;
  showCalendar: boolean;
  showGuestbook: boolean;
  showGift: boolean;
  hasMealOption: boolean;
  mealOptions: unknown;
  customQuestions: unknown;
  theme: unknown;
  template?: { name: string; emoji: string | null; gradient: string | null; theme: unknown } | null;
  giftAccounts?: { id: string; label: string; accountHolder: string; bankName: string | null; accountNumber: string; qrImage: string | null }[];
  messages?: { id: string; name: string; message: string; createdAt: Date }[];
};

export type QuestionDef = { id: string; label: string; required?: boolean };

export type SerializedInvitation = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  eventDate: string | null;
  timezone: string;
  location: string | null;
  locationLink: string | null;
  dressCode: string | null;
  rsvpDeadline: string | null;
  accessCode: string | null;
  defaultLanguage: "en" | "id";
  status: string;
  showCountdown: boolean;
  showCalendar: boolean;
  showGuestbook: boolean;
  showGift: boolean;
  hasMealOption: boolean;
  mealOptions: string[];
  customQuestions: QuestionDef[];
  theme: TemplateTheme;
  template: { name: string; emoji: string | null; gradient: string | null } | null;
  giftAccounts: { id: string; label: string; accountHolder: string; bankName: string | null; accountNumber: string; qrImage: string | null }[];
  messages: { id: string; name: string; message: string; createdAt: string }[];
};

function toQuestions(raw: unknown): QuestionDef[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q): q is { id?: unknown; label?: unknown; required?: unknown } => typeof q === "object" && q !== null)
    .map((q) => ({
      id: String(q.id ?? Math.random().toString(36).slice(2)),
      label: String(q.label ?? ""),
      required: Boolean(q.required),
    }))
    .filter((q) => q.label);
}

function toStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

export function serializeInvitation(inv: PrismaInvite): SerializedInvitation {
  return {
    id: inv.id,
    slug: inv.slug,
    title: inv.title,
    subtitle: inv.subtitle,
    description: inv.description,
    category: inv.category,
    eventDate: inv.eventDate?.toISOString() ?? null,
    timezone: inv.timezone,
    location: inv.location,
    locationLink: inv.locationLink,
    dressCode: inv.dressCode,
    rsvpDeadline: inv.rsvpDeadline?.toISOString() ?? null,
    accessCode: inv.accessCode,
    defaultLanguage: inv.defaultLanguage === "id" ? "id" : "en",
    status: inv.status,
    showCountdown: inv.showCountdown,
    showCalendar: inv.showCalendar,
    showGuestbook: inv.showGuestbook,
    showGift: inv.showGift,
    hasMealOption: inv.hasMealOption,
    mealOptions: toStringArray(inv.mealOptions),
    customQuestions: toQuestions(inv.customQuestions),
    theme: themeForInvitation(inv),
    template: inv.template
      ? { name: inv.template.name, emoji: inv.template.emoji, gradient: inv.template.gradient }
      : null,
    giftAccounts: (inv.giftAccounts ?? []).map((g) => ({
      id: g.id,
      label: g.label,
      accountHolder: g.accountHolder,
      bankName: g.bankName,
      accountNumber: g.accountNumber,
      qrImage: g.qrImage,
    })),
    messages: (inv.messages ?? [])
      .map((m) => ({
        id: m.id,
        name: m.name,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 60),
  };
}

// ── Editor data ───────────────────────────────────────────

export type EditorInvitationData = Omit<SerializedInvitation, "theme"> & {
  /** Partial theme overrides as stored on the invitation */
  themeOverrides: Partial<TemplateTheme>;
  /** Template default theme (shown in the design tab) */
  templateTheme: TemplateTheme;
  collaborators: {
    id: string;
    email: string;
    role: string;
    status: string;
  }[];
};

export function serializeEditorInvitation(inv: PrismaInvite & {
  collaborators?: { id: string; email: string; role: string; status: string }[];
}): EditorInvitationData {
  const templateTheme = (inv.template?.theme ?? null) as TemplateTheme | null;
  const base = themeForInvitation(inv);
  return {
    ...serializeInvitation(inv),
    themeOverrides: (inv.theme ?? {}) as Partial<TemplateTheme>,
    templateTheme: templateTheme ?? base,
    collaborators: (inv.collaborators ?? []).map((c) => ({
      id: c.id,
      email: c.email,
      role: c.role,
      status: c.status,
    })),
  };
}
