"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareHeart, Trash2 } from "lucide-react";
import { deleteMessage } from "@/app/actions/guest-management-actions";

type MessageRow = { id: string; name: string; message: string; createdAt: string };

export function MessagesTab({ invitationId, messages }: { invitationId: string; messages: MessageRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 flex items-center gap-2 font-semibold text-zinc-900">
        <MessageSquareHeart className="h-4 w-4 text-rose-600" /> Guest wishes ({messages.length})
      </h3>
      <p className="mb-4 text-sm text-zinc-400">
        Wishes guests leave on the invitation page. Shown publicly on the invitation.
      </p>

      {messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">
          No wishes yet. Guests can leave messages on the invitation page.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {messages.map((m) => (
            <div key={m.id} className="group rounded-xl border border-zinc-100 p-4">
              <p className="text-sm leading-relaxed text-zinc-700">{m.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs font-medium text-rose-600">— {m.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteMessage(invitationId, m.id);
                        router.refresh();
                      })
                    }
                    disabled={pending}
                    className="rounded-lg p-1.5 text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
