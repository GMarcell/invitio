"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  addGiftAccount,
  deleteGiftAccount,
  updateGiftAccount,
} from "@/app/actions/invitation-actions";
import { Button, Input, Label, Spinner } from "@/components/ui";

type GiftAccountRow = {
  id: string;
  label: string;
  accountHolder: string;
  bankName: string | null;
  accountNumber: string;
  qrImage: string | null;
};

type GiftForm = {
  label: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  qrImage: string;
};

const emptyForm: GiftForm = {
  label: "",
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  qrImage: "",
};

export function GiftPanel({
  invitationId,
  giftAccounts,
}: {
  invitationId: string;
  giftAccounts: GiftAccountRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GiftForm>(emptyForm);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(acc: GiftAccountRow) {
    setEditingId(acc.id);
    setForm({
      label: acc.label,
      accountHolder: acc.accountHolder,
      bankName: acc.bankName ?? "",
      accountNumber: acc.accountNumber,
      qrImage: acc.qrImage ?? "",
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        label: form.label,
        accountHolder: form.accountHolder,
        bankName: form.bankName || null,
        accountNumber: form.accountNumber,
        qrImage: form.qrImage || null,
      };
      const res = editingId
        ? await updateGiftAccount(editingId, payload)
        : await addGiftAccount(invitationId, payload);
      if (res?.error) {
        setError(res.error);
      } else {
        setForm(emptyForm);
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteGiftAccount(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Gift accounts</h3>
        <p className="mt-1 text-xs text-zinc-400">
          Bank accounts or e-wallets shown to guests in the &quot;Send a Gift&quot; section.
          Account numbers appear masked until a guest taps to reveal.
        </p>
      </div>

      {giftAccounts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400">
          No gift accounts yet. Add one below, then enable the gift section in the &quot;Sections&quot; tab.
        </p>
      ) : (
        <div className="space-y-2">
          {giftAccounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-800">
                  {acc.label}
                  {acc.bankName ? <span className="text-zinc-400"> · {acc.bankName}</span> : null}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {acc.accountHolder} · {acc.accountNumber}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => startEdit(acc)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(acc.id)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit form */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-zinc-800">
            {editingId ? "Edit account" : "Add account"}
          </h4>
          <div className="flex items-center gap-1">
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!editingId && giftAccounts.length > 0 && (
              <button
                onClick={startAdd}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Label</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Bride / Groom / E-Wallet"
                required
              />
            </div>
            <div>
              <Label>Bank / wallet name</Label>
              <Input
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="e.g. BCA, GoPay, QRIS"
              />
            </div>
          </div>
          <div>
            <Label>Account holder name</Label>
            <Input
              value={form.accountHolder}
              onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
              placeholder="e.g. Raka Pratama"
              required
            />
          </div>
          <div>
            <Label>Account / wallet number</Label>
            <Input
              value={form.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              placeholder="e.g. 8830123456"
              required
            />
          </div>
          <div>
            <Label>QR code image URL (optional, for e-wallets)</Label>
            <Input
              value={form.qrImage}
              onChange={(e) => setForm((f) => ({ ...f, qrImage: e.target.value }))}
              placeholder="https://…/qris.png"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner />}
            {editingId ? "Save changes" : "Add account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
