"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Gift } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { maskAccountNumber } from "@/lib/utils";

export type GiftAccountView = {
  id: string;
  label: string;
  accountHolder: string;
  bankName: string | null;
  accountNumber: string;
  qrImage: string | null;
};

export function GiftSection({
  accounts,
  lang,
  qrs,
}: {
  accounts: GiftAccountView[];
  lang: Lang;
  qrs?: Record<string, string>;
}) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <div className="mb-5 text-center">
        <div
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: "var(--c-primary)" }}
        >
          <Gift className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-semibold" style={{ color: "var(--c-text)", fontFamily: "var(--c-font-heading)" }}>
          {t("gift.title", lang)}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm opacity-60">{t("gift.subtitle", lang)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((acc) => {
          const isRevealed = revealed[acc.id];
          return (
            <div
              key={acc.id}
              className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--c-surface)", border: "1px solid color-mix(in srgb, var(--c-primary) 15%, transparent)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{acc.label}</p>
              <p className="mt-1 text-sm opacity-80">
                {acc.bankName ? `${acc.bankName} · ` : ""}
                {acc.accountHolder}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--c-bg)" }}>
                <span className="font-mono text-base font-semibold tracking-wide" style={{ color: "var(--c-text)" }}>
                  {isRevealed ? acc.accountNumber : maskAccountNumber(acc.accountNumber)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRevealed((r) => ({ ...r, [acc.id]: !r[acc.id] }))}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium opacity-70 hover:opacity-100"
                    style={{ color: "var(--c-primary)" }}
                  >
                    {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {isRevealed ? t("gift.hide", lang) : t("gift.reveal", lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(acc.accountNumber, acc.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: "var(--c-primary)" }}
                  >
                    {copiedId === acc.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === acc.id ? t("gift.copied", lang) : t("gift.copy", lang)}
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] opacity-50">{t("gift.masked.note", lang)}</p>

              {qrs?.[acc.id] && (
                // eslint-disable-next-line @next/next/no-img-element -- QR codes are inline data URLs; next/image can't optimize them
                <img
                  src={qrs[acc.id]}
                  alt={`QR ${acc.label}`}
                  className="mx-auto mt-3 h-24 w-24 rounded-lg"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
