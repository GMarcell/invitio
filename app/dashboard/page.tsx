import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/site/app-header";
import { InvitationCard } from "@/components/dashboard/invitation-card";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export type InvitationCardData = {
  id: string;
  title: string;
  slug: string;
  status: string;
  eventDate: Date | null;
  location: string | null;
  ownerId: string;
  template: { id: string; name: string; emoji: string | null; gradient: string | null } | null;
  _count: { rsvps: number };
};

export default async function DashboardPage() {
  const user = await requireUser();

  const invitations = (await prisma.invitation.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { collaborators: { some: { email: user.email ?? undefined } } },
      ],
    },
    include: {
      template: { select: { id: true, name: true, emoji: true, gradient: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { updatedAt: "desc" },
  })) as unknown as InvitationCardData[];

  const groups = [
    { key: "active", label: "Published", items: invitations.filter((i) => i.status === "active") },
    { key: "draft", label: "Drafts", items: invitations.filter((i) => i.status === "draft") },
    { key: "past", label: "Past events", items: invitations.filter((i) => i.status === "past") },
  ];

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50">
      <AppHeader name={user.name ?? "Host"} email={user.email ?? ""} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Your invitations</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage, edit and track RSVPs for all your events.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" /> New invitation
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <p className="text-4xl">🎟️</p>
            <h2 className="mt-3 text-lg font-semibold text-zinc-900">No invitations yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
              Pick a template and create your first digital invitation in under 10 minutes.
            </p>
            <Link
              href="/templates"
              className="mt-5 inline-block rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Browse templates
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map(
              (g) =>
                g.items.length > 0 && (
                  <section key={g.key}>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                      {g.label} ({g.items.length})
                    </h2>
                    <div className="space-y-3">
                      {g.items.map((inv) => (
                        <InvitationCard
                          key={inv.id}
                          invitation={inv}
                          isCollaborator={inv.ownerId !== user.id}
                        />
                      ))}
                    </div>
                  </section>
                ),
            )}
          </div>
        )}
      </main>
    </div>
  );
}
