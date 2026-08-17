"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Check,
  Copy,
  Download,
  Mail,
  Minus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  addGuestManually,
  deleteGuest,
  deleteRsvp,
  importGuests,
  sendRemindersNow,
} from "@/app/actions/guest-management-actions";
import { Badge, Button, Input, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { GiftsTab } from "@/components/guests/gifts-tab";
import { MessagesTab } from "@/components/guests/messages-tab";

export type GuestsData = {
  id: string;
  title: string;
  slug: string;
  status: string;
  rsvpDeadline: string | null;
  rsvps: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    guestCount: number;
    mealChoice: string | null;
    note: string | null;
    createdAt: string;
  }[];
  guests: { id: string; name: string; email: string | null; phone: string | null; source: string; rsvpId: string | null }[];
  messages: { id: string; name: string; message: string; createdAt: string }[];
  gifts: {
    id: string;
    giverName: string;
    type: string;
    amount: number | null;
    currency: string;
    notes: string | null;
    thankYouSent: boolean;
    createdAt: string;
  }[];
};

type Tab = "guests" | "gifts" | "messages";

export function GuestsClient({ data }: { data: GuestsData }) {
  const [tab, setTab] = useState<Tab>("guests");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm sm:w-fit">
        {(
          [
            ["guests", `Guests & RSVPs (${data.rsvps.length})`],
            ["gifts", `Gifts (${data.gifts.length})`],
            ["messages", `Wishes (${data.messages.length})`],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none",
              tab === key ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "guests" && <GuestsTab data={data} baseUrl={baseUrl} />}
      {tab === "gifts" && <GiftsTab invitationId={data.id} gifts={data.gifts} />}
      {tab === "messages" && <MessagesTab invitationId={data.id} messages={data.messages} />}
    </div>
  );
}

// ── Guests tab ──────────────────────────────────────────────

function GuestsTab({ data, baseUrl }: { data: GuestsData; baseUrl: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [importErr, setImportErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [newGuest, setNewGuest] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const rsvpByGuest = useMemo(() => {
    const map = new Map<string, GuestsData["rsvps"][number]>();
    for (const r of data.rsvps) map.set(r.name.toLowerCase().trim(), r);
    return map;
  }, [data.rsvps]);

  const pendingGuests = useMemo(
    () =>
      data.guests.filter((g) => {
        const r = rsvpByGuest.get(g.name.toLowerCase().trim());
        return !r;
      }),
    [data.guests, rsvpByGuest],
  );

  const stats = useMemo(() => {
    let yes = 0,
      no = 0,
      maybe = 0,
      yesGuests = 0;
    for (const r of data.rsvps) {
      if (r.status === "yes") {
        yes++;
        yesGuests += r.guestCount;
      } else if (r.status === "no") no++;
      else maybe++;
    }
    return { yes, no, maybe, yesGuests, pending: pendingGuests.length };
  }, [data.rsvps, pendingGuests]);

  const inviteUrl = `${baseUrl}/i/${data.slug}`;

  // ── CSV export ────────────────────────────────────────────
  function exportCsv() {
    const header = ["name", "email", "phone", "status", "guestCount", "mealChoice", "note"];
    const rows: string[][] = [header];

    const seen = new Set<string>();
    for (const g of data.guests) {
      const r = rsvpByGuest.get(g.name.toLowerCase().trim());
      seen.add(g.name.toLowerCase().trim());
      rows.push([
        g.name,
        g.email ?? "",
        g.phone ?? "",
        r?.status ?? "pending",
        r ? String(r.guestCount) : "",
        r?.mealChoice ?? "",
        r?.note ?? "",
      ]);
    }
    // RSVPs from people not on the invited list
    for (const r of data.rsvps) {
      if (seen.has(r.name.toLowerCase().trim())) continue;
      rows.push([r.name, r.email ?? "", r.phone ?? "", r.status, String(r.guestCount), r.mealChoice ?? "", r.note ?? ""]);
    }

    // Neutralize spreadsheet formula injection: cells starting with = + - @ or
    // a tab are prefixed with a single quote so Excel/Sheets treat them as text
    // instead of executing them as formulas.
    const csvSafe = (cell: string) => (/^[=+\-@\t]/.test(cell) ? `'${cell}` : cell);
    const csv = rows
      .map((row) => row.map((c) => `"${csvSafe(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.slug}-guests.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── CSV import ────────────────────────────────────────────
  function onImportFile(file: File) {
    setImportMsg(null);
    setImportErr(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const rows = lines.slice(1).map((line) => {
        const cells = parseCsvLine(line);
        return {
          name: cells[0]?.trim() ?? "",
          email: cells[1]?.trim() || null,
          phone: cells[2]?.trim() || null,
        };
      });
      startTransition(async () => {
        const res = await importGuests(data.id, rows);
        if (res?.error) setImportErr(res.error);
        else {
          setImportMsg(`Imported ${res.imported} guest(s)${res.skipped ? `, skipped ${res.skipped} duplicate(s)` : ""}.`);
          router.refresh();
        }
      });
    };
    reader.readAsText(file);
  }

  function addGuest(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await addGuestManually(data.id, { name: newGuest });
      setNewGuest("");
      router.refresh();
    });
  }

  function emailAllPending() {
    startTransition(async () => {
      const res = await sendRemindersNow(data.id);
      if (res?.error) {
        setReminderMsg(res.error);
      } else {
        setReminderMsg(`Reminder email sent to ${res.sent} guest(s).`);
        router.refresh();
      }
    });
  }

  async function copyReminder(name: string) {
    const msg = `Halo ${name}! Kami mengundang Anda untuk acara "${data.title}". Mohon konfirmasi kehadiran Anda di sini ya: ${inviteUrl} 🙏`;
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      /* ignore */
    }
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Attending", value: stats.yes, sub: `${stats.yesGuests} guests`, tone: "text-emerald-600" },
          { label: "Maybe", value: stats.maybe, sub: "responded", tone: "text-amber-600" },
          { label: "Declined", value: stats.no, sub: "responded", tone: "text-red-600" },
          { label: "Pending", value: stats.pending, sub: "no response", tone: "text-zinc-600" },
          { label: "Total invited", value: data.guests.length, sub: `${data.rsvps.length} responded`, tone: "text-zinc-900" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className={cn("text-2xl font-bold", s.tone)}>{s.value}</p>
            <p className="text-sm font-medium text-zinc-700">{s.label}</p>
            <p className="text-xs text-zinc-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Import / export */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
            e.target.value = "";
          }}
        />
        <span className="text-xs text-zinc-400">CSV columns: name, email, phone</span>
      </div>
      {importMsg && <p className="text-sm font-medium text-emerald-600">{importMsg}</p>}
      {importErr && <p className="text-sm font-medium text-red-600">{importErr}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Pending */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-zinc-900">Waiting for response ({stats.pending})</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={emailAllPending}
              disabled={pending || pendingGuests.length === 0}
              title="Send a reminder email to all pending guests with an email on file"
            >
              <Mail className="h-3.5 w-3.5" /> Email pending
            </Button>
          </div>
          {reminderMsg && (
            <p className="mb-2 text-sm font-medium text-emerald-600">{reminderMsg}</p>
          )}
          {pendingGuests.length === 0 ? (
            <p className="text-sm text-zinc-400">Everyone on your guest list has responded 🎉</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {pendingGuests.map((g) => (
                <div key={g.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800">{g.name}</p>
                    <p className="truncate text-xs text-zinc-400">
                      {g.email ?? g.phone ?? "No contact"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => copyReminder(g.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                      title="Copy reminder message"
                    >
                      {copiedId === g.name ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === g.name ? "Copied" : "Reminder"}
                    </button>
                    {g.email && (
                      <a
                        href={`mailto:${g.email}?subject=${encodeURIComponent(`RSVP — ${data.title}`)}&body=${encodeURIComponent(
                          `Hi ${g.name}, we'd love to know if you can join us for "${data.title}". Please respond here: ${inviteUrl}`,
                        )}`}
                        className="rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:bg-zinc-50"
                        title="Send email reminder"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await deleteGuest(data.id, g.id);
                          router.refresh();
                        })
                      }
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove from list"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={addGuest} className="mt-3 flex items-center gap-2">
            <Input
              value={newGuest}
              onChange={(e) => setNewGuest(e.target.value)}
              placeholder="Add a guest manually…"
            />
            <Button type="submit" disabled={pending} variant="secondary" size="sm" className="shrink-0">
              {pending ? <Spinner /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </form>
        </div>

        {/* Responses */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-zinc-900">Responses ({data.rsvps.length})</h3>
          {data.rsvps.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No RSVPs yet. Share your invitation link to start collecting responses.
            </p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
              {data.rsvps.map((r) => (
                <div key={r.id} className="rounded-lg border border-zinc-100 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-zinc-800">
                      {r.name}
                      <span className="ml-2 text-xs font-normal text-zinc-400">
                        {r.guestCount > 1 ? `${r.guestCount} guests` : "1 guest"}
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Badge tone={r.status === "yes" ? "green" : r.status === "maybe" ? "amber" : "red"}>
                        {r.status === "yes" ? "Attending" : r.status === "maybe" ? "Maybe" : "Declined"}
                      </Badge>
                      <button
                        onClick={() =>
                          startTransition(async () => {
                            await deleteRsvp(data.id, r.id);
                            router.refresh();
                          })
                        }
                        className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {(r.email || r.phone) && (
                    <p className="mt-0.5 truncate text-xs text-zinc-400">
                      {[r.email, r.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {r.mealChoice && (
                    <p className="mt-0.5 text-xs text-zinc-500">🍽 {r.mealChoice}</p>
                  )}
                  {r.note && <p className="mt-1 text-xs italic text-zinc-500">“{r.note}”</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CSV line parser (handles simple quoted fields) ──────────

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
