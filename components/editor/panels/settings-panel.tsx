"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import {
  addCollaborator,
  deleteInvitation,
  removeCollaborator,
} from "@/app/actions/invitation-actions";
import { Badge, Button, Input, Label, Spinner } from "@/components/ui";
import type { EditorForm } from "@/components/editor/types";

export function SettingsPanel({
  form,
  setForm,
  status,
  onPublish,
  collaborators,
  invitationId,
}: {
  form: EditorForm;
  setForm: React.Dispatch<React.SetStateAction<EditorForm>>;
  status: string;
  onPublish: () => void;
  collaborators: { id: string; email: string; role: string; status: string }[];
  invitationId: string;
}) {
  const router = useRouter();
  const [collabEmail, setCollabEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [collabError, setCollabError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function addCollab(e: React.FormEvent) {
    e.preventDefault();
    setCollabError(null);
    startTransition(async () => {
      const res = await addCollaborator(invitationId, collabEmail);
      if (res?.error) {
        setCollabError(res.error);
      } else {
        setCollabEmail("");
        router.refresh();
      }
    });
  }

  function removeCollab(id: string) {
    startTransition(async () => {
      await removeCollaborator(id);
      router.refresh();
    });
  }

  function removeInvitation() {
    startTransition(async () => {
      await deleteInvitation(invitationId);
      router.push("/dashboard");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Link & access</h3>
        <div className="mt-3 space-y-3">
          <div>
            <Label htmlFor="slug">Link slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">…/i/</span>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))
                }
              />
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Lowercase letters, numbers and dashes only.
            </p>
          </div>
          <div>
            <Label htmlFor="accessCode">Access code (optional)</Label>
            <Input
              id="accessCode"
              value={form.accessCode}
              onChange={(e) => setForm((f) => ({ ...f, accessCode: e.target.value }))}
              placeholder="Leave empty for a public invitation"
            />
            <p className="mt-1 text-xs text-zinc-400">
              Guests need this code to view the invitation — great for private events.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-5">
        <h3 className="text-sm font-semibold text-zinc-900">Co-hosts</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Invite a partner or organizer to edit this invitation and manage RSVPs together.
        </p>

        {collaborators.length > 0 && (
          <div className="mt-3 space-y-2">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-800">{c.email}</span>
                  <Badge tone={c.status === "accepted" ? "green" : "amber"}>
                    {c.status === "accepted" ? "Joined" : "Invited"}
                  </Badge>
                </div>
                <button
                  onClick={() => removeCollab(c.id)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={addCollab} className="mt-3 flex items-center gap-2">
          <Input
            type="email"
            value={collabEmail}
            onChange={(e) => setCollabEmail(e.target.value)}
            placeholder="partner@example.com"
            required
          />
          <Button type="submit" disabled={pending} variant="secondary" className="shrink-0">
            {pending ? <Spinner /> : <UserPlus className="h-4 w-4" />}
            Invite
          </Button>
        </form>
        {collabError && <p className="mt-2 text-sm text-red-600">{collabError}</p>}
        <p className="mt-2 text-xs text-zinc-400">
          Invitees get access once they sign in with the same email.
        </p>
      </div>

      <div className="border-t border-zinc-100 pt-5">
        <h3 className="text-sm font-semibold text-zinc-900">Publishing</h3>
        {status !== "active" ? (
          <p className="mt-1 text-xs text-zinc-400">
            Your invitation is currently a draft. Publish it to make the page live.
          </p>
        ) : (
          <p className="mt-1 text-xs text-zinc-400">
            Your invitation is live. Guests can RSVP at the invitation link.
          </p>
        )}
        {status !== "active" && (
          <Button onClick={onPublish} className="mt-3">
            Publish invitation
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <h3 className="text-sm font-semibold text-red-700">Danger zone</h3>
        <p className="mt-1 text-xs text-red-500">
          Permanently delete this invitation, its RSVPs and guestbook messages.
        </p>
        {confirmingDelete ? (
          <div className="mt-3 flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={removeInvitation} disabled={pending}>
              Yes, delete forever
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="danger" size="sm" className="mt-3" onClick={() => setConfirmingDelete(true)}>
            Delete invitation
          </Button>
        )}
      </div>
    </div>
  );
}
