"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarPlus,
  Clock,
  Heart,
  Languages,
  MapPin,
  MessageSquareHeart,
  Pencil,
  Shirt,
  Download,
} from "lucide-react";
import { t, type Lang } from "@/lib/i18n";
import { formatDate, formatTime } from "@/lib/utils";
import { fontFamily } from "@/components/invite/fonts";
import { Countdown } from "@/components/invite/countdown";
import { RsvpForm } from "@/components/invite/rsvp-form";
import { GiftSection } from "@/components/invite/gift-section";
import { ShareSection } from "@/components/invite/share-section";
import type { SerializedInvitation } from "@/lib/serialize";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";
import { addGuestbookMessage } from "@/app/actions/guest-actions";

function isPast(d: Date): boolean {
  return d.getTime() < Date.now();
}

export function InvitationView({
  data,
  mode,
  isOwner = false,
  giftQrs,
  linkQr,
  baseUrl,
}: {
  data: SerializedInvitation;
  mode: "live" | "preview";
  isOwner?: boolean;
  giftQrs?: Record<string, string>;
  linkQr?: string | null;
  baseUrl?: string;
}) {
  const [lang, setLang] = useState<Lang>(data.defaultLanguage);

  function changeLang(next: Lang) {
    setLang(next);
  }

  const theme = data.theme;
  const cssVars = {
    "--c-primary": theme.colors.primary,
    "--c-secondary": theme.colors.secondary,
    "--c-accent": theme.colors.accent,
    "--c-bg": theme.colors.bg,
    "--c-surface": theme.colors.surface,
    "--c-text": theme.colors.text,
    "--c-muted": theme.colors.muted,
    "--c-font-heading": fontFamily(theme.fonts.heading),
    "--c-font-body": fontFamily(theme.fonts.body),
    "--c-font-script": fontFamily(theme.fonts.script),
  } as React.CSSProperties;

  const eventDate = data.eventDate ? new Date(data.eventDate) : null;
  const eventPassed = eventDate ? isPast(eventDate) : false;
  const showCountdown = data.showCountdown && eventDate && !eventPassed;

  const dateFormatOpts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: data.timezone,
  };
  const timeFormatOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: data.timezone,
  };

  return (
    <div
      style={{
        ...cssVars,
        backgroundColor: "var(--c-bg)",
        color: "var(--c-text)",
        fontFamily: "var(--c-font-body)",
      }}
      className="relative"
    >
      {mode === "live" && isOwner && (
        <Link
          href={`/invitations/${data.id}/edit`}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-zinc-800"
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      )}

      <div className="mx-auto min-h-svh w-full max-w-xl shadow-xl">
        {/* ── Language toggle ─────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-1.5 text-xs opacity-60">
            <Languages className="h-3.5 w-3.5" />
            <button
              onClick={() => changeLang("en")}
              className={lang === "en" ? "font-bold underline underline-offset-4" : ""}
            >
              EN
            </button>
            <span>·</span>
            <button
              onClick={() => changeLang("id")}
              className={lang === "id" ? "font-bold underline underline-offset-4" : ""}
            >
              ID
            </button>
          </div>
          <span className="text-xs opacity-40">{data.template?.name ?? "Invitio"}</span>
        </div>

        {/* ── Cover ───────────────────────────────────────── */}
        <section
          className="relative overflow-hidden px-6 pb-14 pt-10 text-center"
          style={{
            background: `linear-gradient(160deg, var(--c-primary) 0%, color-mix(in srgb, var(--c-primary) 55%, var(--c-secondary)) 55%, var(--c-secondary) 100%)`,
          }}
        >
          {decoEmojis(theme.deco)}
          <p
            className="text-xs uppercase tracking-[0.35em]"
            style={{ color: "color-mix(in srgb, var(--c-bg) 85%, transparent)", fontFamily: "var(--c-font-body)" }}
          >
            {t("join.us", lang)}
          </p>
          {theme.fonts.script && (
            <p
              className="mt-4 text-4xl sm:text-5xl"
              style={{ color: "var(--c-bg)", fontFamily: "var(--c-font-script)" }}
            >
              &amp;
            </p>
          )}
          <h1
            className="mt-2 animate-fade-up text-4xl font-semibold leading-tight sm:text-5xl"
            style={{ color: "var(--c-bg)", fontFamily: "var(--c-font-heading)" }}
          >
            {data.title}
          </h1>
          {data.subtitle && (
            <p className="mt-3 text-base tracking-wide" style={{ color: "color-mix(in srgb, var(--c-bg) 90%, transparent)" }}>
              {data.subtitle}
            </p>
          )}
          {eventDate && (
            <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 text-sm" style={{ color: "var(--c-bg)" }}>
              <Calendar className="h-4 w-4" />
              {formatDate(eventDate, dateFormatOpts)} · {formatTime(eventDate, timeFormatOpts)}
            </p>
          )}
        </section>

        {/* ── Countdown ───────────────────────────────────── */}
        {showCountdown && data.eventDate && (
          <section className="px-6 py-8">
            <Countdown target={data.eventDate} lang={lang} />
          </section>
        )}

        {/* ── Details ─────────────────────────────────────── */}
        {(eventDate || data.location || data.dressCode) && (
          <section className="px-6 pb-4">
            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{ backgroundColor: "var(--c-surface)", border: "1px solid color-mix(in srgb, var(--c-primary) 15%, transparent)" }}
            >
              <h2
                className="mb-4 text-center text-xl font-semibold"
                style={{ color: "var(--c-text)", fontFamily: "var(--c-font-heading)" }}
              >
                {t("event.details", lang)}
              </h2>
              <div className="space-y-4">
                {eventDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: "var(--c-primary)" }} />
                    <div>
                      <p className="text-sm font-medium">{formatDate(eventDate, dateFormatOpts)}</p>
                      <p className="text-sm opacity-70">
                        {formatTime(eventDate, timeFormatOpts)} · {data.timezone}
                      </p>
                    </div>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: "var(--c-primary)" }} />
                    <div>
                      <p className="text-sm font-medium">{data.location}</p>
                      {data.locationLink && (
                        <a
                          href={data.locationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium underline underline-offset-2"
                          style={{ color: "var(--c-primary)" }}
                        >
                          {t("maps.open", lang)}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {data.dressCode && (
                  <div className="flex items-start gap-3">
                    <Shirt className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: "var(--c-primary)" }} />
                    <p className="text-sm font-medium">{data.dressCode}</p>
                  </div>
                )}
                {data.rsvpDeadline && (
                  <p className="pt-1 text-xs opacity-60">
                    {t("rsvp.deadline", lang)}: {formatDate(new Date(data.rsvpDeadline), dateFormatOpts)}
                  </p>
                )}
              </div>

              {data.showCalendar && eventDate && (
                <div className="mt-5 border-t pt-4" style={{ borderColor: "color-mix(in srgb, var(--c-primary) 15%, transparent)" }}>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium opacity-70">
                    <CalendarPlus className="h-3.5 w-3.5" /> {t("add.calendar", lang)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={googleCalendarUrl({
                        title: data.title,
                        description: data.description ?? "",
                        location: data.location ?? "",
                        start: eventDate,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: "var(--c-primary)" }}
                    >
                      {t("calendar.google", lang)}
                    </a>
                    <a
                      href={outlookCalendarUrl({
                        title: data.title,
                        description: data.description ?? "",
                        location: data.location ?? "",
                        start: eventDate,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border px-3 py-1.5 text-xs font-medium"
                      style={{ borderColor: "color-mix(in srgb, var(--c-primary) 40%, transparent)", color: "var(--c-text)" }}
                    >
                      {t("calendar.outlook", lang)}
                    </a>
                    <a
                      href={`/api/ics/${data.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium"
                      style={{ borderColor: "color-mix(in srgb, var(--c-primary) 40%, transparent)", color: "var(--c-text)" }}
                    >
                      <Download className="h-3 w-3" /> {t("calendar.ics", lang)}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Description ─────────────────────────────────── */}
        {data.description && (
          <section className="px-6 py-4">
            <p className="mx-auto max-w-md whitespace-pre-line text-center text-[15px] leading-relaxed opacity-80">
              {data.description}
            </p>
          </section>
        )}

        {/* ── Gift section ────────────────────────────────── */}
        {data.showGift && data.giftAccounts.length > 0 && (
          <section className="px-6 py-6">
            <GiftSection accounts={data.giftAccounts} lang={lang} qrs={giftQrs} />
          </section>
        )}

        {/* ── RSVP ────────────────────────────────────────── */}
        <section className="px-6 py-6">
          <RsvpForm
            invitationId={data.id}
            lang={lang}
            hasMealOption={data.hasMealOption}
            mealOptions={data.mealOptions}
            customQuestions={data.customQuestions}
            preview={mode !== "live"}
          />
        </section>

        {/* ── Guestbook ───────────────────────────────────── */}
        {data.showGuestbook && (
          <section className="px-6 pb-6">
            <Guestbook data={data} lang={lang} preview={mode !== "live"} />
          </section>
        )}

        {/* ── Share ───────────────────────────────────────── */}
        {mode === "live" && baseUrl && (
          <section className="border-t px-6 py-8" style={{ borderColor: "color-mix(in srgb, var(--c-primary) 12%, transparent)" }}>
            <ShareSection url={`${baseUrl}/i/${data.slug}`} title={data.title} lang={lang} linkQr={linkQr} />
          </section>
        )}

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="px-6 pb-10 pt-4 text-center">
          <p className="text-xs opacity-50">
            {t("footer.made", lang)}{" "}
            <Link href="/" className="font-semibold underline underline-offset-2">
              {t("footer.invitio", lang)}
            </Link>
            <Heart className="mx-1 inline h-3 w-3" style={{ color: "var(--c-primary)" }} />
          </p>
        </footer>
      </div>
    </div>
  );
}

// ── Decorative emojis for the cover ─────────────────────────

function decoEmojis(deco: string): React.ReactNode {
  const sets: Record<string, string[]> = {
    floral: ["🌸", "🌷", "🌹"],
    confetti: ["🎉", "🎊", "🎈"],
    dots: ["●", "●", "●"],
    stars: ["⭐", "✨", "🌟"],
    lines: ["—", "—", "—"],
    minimal: [],
  };
  const emojis = sets[deco] ?? [];
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden>
      {emojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-2xl opacity-25"
          style={{
            left: `${12 + i * 30}%`,
            top: `${10 + (i % 2) * 40}%`,
            transform: "rotate(-15deg)",
          }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}

// ── Guestbook ───────────────────────────────────────────────

function Guestbook({ data, lang, preview = false }: { data: SerializedInvitation; lang: Lang; preview?: boolean }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const res = await addGuestbookMessage(data.id, { name, message });
    setSending(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setSent(true);
      setName("");
      setMessage("");
    }
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-7"
      style={{ backgroundColor: "var(--c-surface)", border: "1px solid color-mix(in srgb, var(--c-primary) 15%, transparent)" }}
    >
      <div className="mb-4 text-center">
        <MessageSquareHeart className="mx-auto mb-2 h-6 w-6" style={{ color: "var(--c-primary)" }} />
        <h3 className="text-xl font-semibold" style={{ color: "var(--c-text)", fontFamily: "var(--c-font-heading)" }}>
          {t("guestbook.title", lang)}
        </h3>
        <p className="mt-1 text-sm opacity-60">{t("guestbook.subtitle", lang)}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("guestbook.name", lang)}
          required
          className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--c-bg)",
            color: "var(--c-text)",
            borderColor: "color-mix(in srgb, var(--c-primary) 25%, transparent)",
          }}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("guestbook.placeholder", lang)}
          required
          rows={3}
          className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--c-bg)",
            color: "var(--c-text)",
            borderColor: "color-mix(in srgb, var(--c-primary) 25%, transparent)",
          }}
        />
        {error && (
          <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#b91c1c" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
          style={{ backgroundColor: "var(--c-primary)" }}
        >
          {sent ? t("guestbook.sent", lang) : sending ? "…" : t("guestbook.submit", lang)}
        </button>
      </form>

      {preview && (
        <p className="mt-4 rounded-lg border border-dashed px-3 py-2 text-center text-xs opacity-50" style={{ borderColor: "color-mix(in srgb, var(--c-primary) 40%, transparent)" }}>
          Guestbook preview — wishes from your guests will appear here.
        </p>
      )}

      {data.messages.length > 0 ? (
        <div className="mt-5 space-y-3">
          {data.messages.slice(0, 20).map((m) => (
            <div
              key={m.id}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: "var(--c-bg)" }}
            >
              <p className="text-sm leading-relaxed">{m.message}</p>
              <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--c-primary)" }}>
                — {m.name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-center text-sm opacity-50">{t("guestbook.empty", lang)}</p>
      )}
    </div>
  );
}
