import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireEditAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/site/app-header";
import { GuestsClient } from "@/components/guests/guests-client";

export const metadata: Metadata = { title: "Guests & RSVPs" };
export const dynamic = "force-dynamic";

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireEditAccess(id);

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      rsvps: { orderBy: { createdAt: "desc" }, include: { guest: true } },
      guests: { orderBy: [{ rsvpId: "asc" }, { name: "asc" }] },
      messages: { orderBy: { createdAt: "desc" } },
      gifts: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!invitation) notFound();

  const data = {
    id: invitation.id,
    title: invitation.title,
    slug: invitation.slug,
    status: invitation.status,
    rsvpDeadline: invitation.rsvpDeadline?.toISOString() ?? null,
    rsvps: invitation.rsvps.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      status: r.status,
      guestCount: r.guestCount,
      mealChoice: r.mealChoice,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    })),
    guests: invitation.guests.map((g) => ({
      id: g.id,
      name: g.name,
      email: g.email,
      phone: g.phone,
      source: g.source,
      rsvpId: g.rsvpId,
    })),
    messages: invitation.messages.map((m) => ({
      id: m.id,
      name: m.name,
      message: m.message,
      createdAt: m.createdAt.toISOString(),
    })),
    gifts: invitation.gifts.map((g) => ({
      id: g.id,
      giverName: g.giverName,
      type: g.type,
      amount: g.amount,
      currency: g.currency,
      notes: g.notes,
      thankYouSent: g.thankYouSent,
      createdAt: g.createdAt.toISOString(),
    })),
  };

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50">
      <AppHeader name={user.name ?? "Host"} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/invitations/${id}/edit`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              <ChevronLeft className="h-4 w-4" /> Editor
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-zinc-900">Guests & RSVPs</h1>
              <p className="text-sm text-zinc-500">{invitation.title}</p>
            </div>
          </div>
          <Link
            href={`/i/${invitation.slug}`}
            target="_blank"
            className="text-sm font-medium text-rose-600 hover:underline"
          >
            View invitation page →
          </Link>
        </div>
        <GuestsClient data={data} />
      </main>
    </div>
  );
}
