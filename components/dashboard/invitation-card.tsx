"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Copy, ExternalLink, Eye, Pencil, Trash2, Users } from "lucide-react";
import { duplicateInvitation, deleteInvitation, setInvitationStatus } from "@/app/actions/invitation-actions";
import { Badge, Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { InvitationCardData } from "@/app/dashboard/page";

export function InvitationCard({
  invitation,
  isCollaborator,
}: {
  invitation: InvitationCardData;
  isCollaborator: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const tpl = invitation.template;
  const rsvpCount = invitation._count.rsvps;

  function toggleStatus() {
    startTransition(async () => {
      await setInvitationStatus(invitation.id, invitation.status === "active" ? "draft" : "active");
      router.refresh();
    });
  }

  function duplicate() {
    startTransition(async () => {
      await duplicateInvitation(invitation.id);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteInvitation(invitation.id);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div
        className="hidden h-20 w-16 shrink-0 items-center justify-center rounded-lg text-2xl sm:flex"
        style={{ background: tpl?.gradient ?? "#e5e7eb" }}
      >
        {tpl?.emoji ?? "🎟️"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/invitations/${invitation.id}/edit`}
            className="truncate text-base font-semibold text-zinc-900 hover:text-rose-600"
          >
            {invitation.title}
          </Link>
          {isCollaborator && <Badge tone="blue">Co-host</Badge>}
          <Badge tone={invitation.status === "active" ? "green" : invitation.status === "past" ? "zinc" : "amber"}>
            {invitation.status === "active" ? "Published" : invitation.status === "past" ? "Past" : "Draft"}
          </Badge>
        </div>

        <p className="mt-0.5 truncate text-sm text-zinc-500">
          {invitation.eventDate
            ? formatDate(invitation.eventDate, { year: "numeric", month: "short", day: "numeric" })
            : "No date set yet"}
          {invitation.location ? ` · ${invitation.location}` : ""}
        </p>

        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {rsvpCount} RSVPs
          </span>
          {invitation.status === "active" && (
            <Link href={`/i/${invitation.slug}`} className="inline-flex items-center gap-1 text-rose-600 hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> View live page
            </Link>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <div className="flex gap-1.5">
          <Link
            href={`/invitations/${invitation.id}/edit`}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Link
            href={`/invitations/${invitation.id}/guests`}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            title="Guests & RSVPs"
          >
            <Users className="h-4 w-4" />
          </Link>
          <Link
            href={`/i/${invitation.slug}`}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleStatus}
            disabled={pending}
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
          >
            {invitation.status === "active" ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={duplicate}
            disabled={pending}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          {confirming ? (
            <Button size="sm" variant="danger" onClick={remove} disabled={pending}>
              Confirm delete
            </Button>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
