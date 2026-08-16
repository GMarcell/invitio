"use client";

import { useState } from "react";
import { Check, PartyPopper, X } from "lucide-react";
import { submitRsvp } from "@/app/actions/guest-actions";
import { t, type Lang } from "@/lib/i18n";
import type { QuestionDef } from "@/lib/serialize";
import { cn } from "@/lib/utils";

type Status = "yes" | "no" | "maybe";

export function RsvpForm({
  invitationId,
  lang,
  hasMealOption,
  mealOptions,
  customQuestions,
  preview = false,
}: {
  invitationId: string;
  lang: Lang;
  hasMealOption: boolean;
  mealOptions: string[];
  customQuestions: QuestionDef[];
  preview?: boolean;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [mealChoice, setMealChoice] = useState("");
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const statusOptions: { value: Status; label: string; icon: React.ReactNode }[] = [
    { value: "yes", label: t("rsvp.yes", lang), icon: <Check className="h-4 w-4" /> },
    { value: "maybe", label: t("rsvp.maybe", lang), icon: <PartyPopper className="h-4 w-4" /> },
    { value: "no", label: t("rsvp.no", lang), icon: <X className="h-4 w-4" /> },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!status) {
      setError(t("rsvp.required", lang));
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await submitRsvp(invitationId, {
      name,
      email,
      phone,
      status,
      guestCount,
      mealChoice: hasMealOption ? mealChoice : "",
      note,
      answers,
    });
    setSubmitting(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setDone(true);
    }
  }

  if (preview) {
    return (
      <div
        className="rounded-2xl p-6 text-center shadow-sm"
        style={{ backgroundColor: "var(--c-surface)", border: "1px dashed color-mix(in srgb, var(--c-primary) 40%, transparent)" }}
      >
        <h3 className="text-xl font-semibold" style={{ color: "var(--c-text)", fontFamily: "var(--c-font-heading)" }}>
          {t("rsvp.title", lang)}
        </h3>
        <p className="mt-1 text-sm opacity-50">{t("rsvp.subtitle", lang)}</p>
        <div className="mx-auto mt-4 max-w-xs space-y-2">
          <div className="h-9 rounded-lg" style={{ backgroundColor: "var(--c-bg)" }} />
          <div className="h-9 rounded-lg" style={{ backgroundColor: "var(--c-bg)" }} />
          <div className="h-10 rounded-xl" style={{ backgroundColor: "var(--c-primary)", opacity: 0.35 }} />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: "var(--c-surface)" }}>
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: "var(--c-primary)" }}
        >
          <Check className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-semibold" style={{ color: "var(--c-text)" }}>
          {t("rsvp.thanks", lang)}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm opacity-75">{t("rsvp.thanks.body", lang)}</p>
        <p className="mt-3 text-xs opacity-50">{t("rsvp.update", lang)}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2";
  const inputStyle = {
    backgroundColor: "var(--c-surface)",
    color: "var(--c-text)",
    borderColor: "color-mix(in srgb, var(--c-primary) 30%, transparent)",
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl p-6 shadow-sm sm:p-8"
      style={{ backgroundColor: "var(--c-surface)", border: "1px solid color-mix(in srgb, var(--c-primary) 15%, transparent)" }}
    >
      <h3 className="text-center text-2xl font-semibold" style={{ color: "var(--c-text)", fontFamily: "var(--c-font-heading)" }}>
        {t("rsvp.title", lang)}
      </h3>
      <p className="mt-1 text-center text-sm opacity-60">{t("rsvp.subtitle", lang)}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatus(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition sm:text-sm",
            )}
            style={
              status === opt.value
                ? { backgroundColor: "var(--c-primary)", color: "#fff", borderColor: "var(--c-primary)" }
                : { backgroundColor: "var(--c-bg)", color: "var(--c-text)", borderColor: "color-mix(in srgb, var(--c-primary) 25%, transparent)" }
            }
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <input
          className={inputClass}
          style={inputStyle}
          placeholder={t("rsvp.name", lang) + " *"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={inputClass}
            style={inputStyle}
            type="email"
            placeholder={t("rsvp.email", lang)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputClass}
            style={inputStyle}
            type="tel"
            placeholder={t("rsvp.phone", lang)}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs opacity-60">{t("rsvp.count", lang)}</label>
          <select
            className={inputClass}
            style={inputStyle}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {hasMealOption && mealOptions.length > 0 && (
          <div>
            <label className="mb-1 block text-xs opacity-60">{t("rsvp.meal", lang)}</label>
            <select
              className={inputClass}
              style={inputStyle}
              value={mealChoice}
              onChange={(e) => setMealChoice(e.target.value)}
            >
              <option value="">—</option>
              {mealOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {customQuestions.map((q) => (
          <input
            key={q.id}
            className={inputClass}
            style={inputStyle}
            placeholder={`${q.label}${q.required ? " *" : ""}`}
            value={answers[q.id] ?? ""}
            required={q.required}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
          />
        ))}

        <textarea
          className={inputClass}
          style={inputStyle}
          rows={2}
          placeholder={t("rsvp.note", lang)}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
        style={{ backgroundColor: "var(--c-primary)" }}
      >
        {submitting ? t("rsvp.submitting", lang) : t("rsvp.submit", lang)}
      </button>
    </form>
  );
}
