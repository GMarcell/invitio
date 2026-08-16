"use client";

import { useState } from "react";
import { Check, Copy, Link2, Mail, MessageCircle, QrCode, X } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

export function ShareSection({
  url,
  title,
  lang,
  linkQr,
}: {
  url: string;
  title: string;
  lang: Lang;
  linkQr?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const message = encodeURIComponent(`You're invited to ${title}! 💌 ${url}`);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="text-center">
      <p className="mb-3 text-sm font-medium opacity-70">{t("share.title", lang)}</p>
      <div className="flex items-center justify-center gap-3">
        <a
          href={`https://wa.me/?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:opacity-85"
          style={{ backgroundColor: "#25D366" }}
          title="WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(`You're invited to ${title}`)}&body=${message}`}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:opacity-85"
          style={{ backgroundColor: "#EA4335" }}
          title="Email"
        >
          <Mail className="h-5 w-5" />
        </a>
        <button
          onClick={copyLink}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:opacity-85"
          style={{ backgroundColor: "var(--c-primary)" }}
          title={t("share.copy", lang)}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>
        {linkQr && (
          <button
            onClick={() => setShowQr(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border transition hover:opacity-85"
            style={{ color: "var(--c-text)", borderColor: "color-mix(in srgb, var(--c-primary) 40%, transparent)" }}
            title={t("share.qr", lang)}
          >
            <QrCode className="h-5 w-5" />
          </button>
        )}
      </div>
      {copied && (
        <p className="mt-2 text-xs font-medium" style={{ color: "var(--c-primary)" }}>
          {t("share.copied", lang)}
        </p>
      )}

      {showQr && linkQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowQr(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-6 text-center"
            style={{ backgroundColor: "var(--c-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold" style={{ color: "var(--c-text)" }}>
                {t("share.qr", lang)}
              </p>
              <button onClick={() => setShowQr(false)} style={{ color: "var(--c-text)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- QR code is an inline data URL */}
            <img src={linkQr} alt="QR" className="mx-auto w-56 rounded-lg" />
            <p className="mt-3 flex items-center justify-center gap-1 text-xs opacity-60">
              <Link2 className="h-3.5 w-3.5" /> {url}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
