"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Gift, Heart, Trash2 } from "lucide-react";
import { addGift, deleteGift, updateGift } from "@/app/actions/guest-management-actions";
import { Badge, Button, Input, Label, Select, Spinner, Toggle, Textarea } from "@/components/ui";

type GiftRow = {
  id: string;
  giverName: string;
  type: string;
  amount: number | null;
  currency: string;
  notes: string | null;
  thankYouSent: boolean;
  createdAt: string;
};

export function GiftsTab({ invitationId, gifts }: { invitationId: string; gifts: GiftRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ giverName: "", type: "cash", amount: "", currency: "USD", notes: "" });
  const [error, setError] = useState<string | null>(null);

  const totalCash = gifts
    .filter((g) => g.type === "cash" && g.amount != null)
    .reduce((sum, g) => sum + g.amount!, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addGift(invitationId, {
        giverName: form.giverName,
        type: form.type,
        amount: form.amount ? Number(form.amount) : undefined,
        currency: form.currency,
        notes: form.notes,
      });
      if (res?.error) {
        setError(res.error);
      } else {
        setForm({ giverName: "", type: "cash", amount: "", currency: "USD", notes: "" });
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900">
            <Gift className="h-4 w-4 text-rose-600" /> Gift log ({gifts.length})
          </h3>
          {totalCash > 0 && (
            <Badge tone="green">
              Cash total: {formatMoney(totalCash, gifts.filter((g) => g.currency).map((g) => g.currency)[0] ?? "USD")}
            </Badge>
          )}
        </div>

        {gifts.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            No gifts logged yet. Add gifts received so you can send thank-yous later.
          </p>
        ) : (
          <div className="space-y-2">
            {gifts.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-800">{g.giverName}</p>
                  <p className="truncate text-xs text-zinc-400">
                    <Badge tone={g.type === "cash" ? "green" : g.type === "physical" ? "blue" : "zinc"}>
                      {g.type}
                    </Badge>{" "}
                    {g.type === "cash" && g.amount != null && (
                      <span className="ml-1 font-medium text-zinc-600">
                        {formatMoney(g.amount, g.currency)}
                      </span>
                    )}
                    {g.notes && <span className="ml-1">· {g.notes}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Heart className={g.thankYouSent ? "h-3.5 w-3.5 fill-rose-500 text-rose-500" : "h-3.5 w-3.5 text-zinc-300"} />
                    Thank-you sent
                    <Toggle
                      checked={g.thankYouSent}
                      onChange={(v) =>
                        startTransition(async () => {
                          await updateGift(g.id, { thankYouSent: v });
                          router.refresh();
                        })
                      }
                    />
                  </label>
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteGift(g.id);
                        router.refresh();
                      })
                    }
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold text-zinc-900">Log a gift</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Giver name</Label>
            <Input
              value={form.giverName}
              onChange={(e) => setForm((f) => ({ ...f, giverName: e.target.value }))}
              placeholder="e.g. Aunt Maya"
              required
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="cash">Cash / transfer</option>
              <option value="physical">Physical gift</option>
              <option value="other">Other</option>
            </Select>
          </div>
          {form.type === "cash" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="1000000"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
                  placeholder="IDR"
                />
              </div>
            </div>
          )}
          <div>
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Transferred to BCA"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Spinner />} Add gift
          </Button>
        </form>
      </div>
    </div>
  );
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}
