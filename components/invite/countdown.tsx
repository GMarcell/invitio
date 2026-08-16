"use client";

import { useEffect, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

type Diff = { days: number; hours: number; minutes: number; seconds: number } | null;

function diffFromNow(target: string): Diff {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return null;
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  };
}

export function Countdown({ target, lang }: { target: string; lang: Lang }) {
  const [remaining, setRemaining] = useState<Diff>(() => diffFromNow(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(diffFromNow(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!remaining) return null;

  const cells = [
    { value: remaining.days, label: t("countdown.days", lang) },
    { value: remaining.hours, label: t("countdown.hours", lang) },
    { value: remaining.minutes, label: t("countdown.minutes", lang) },
    { value: remaining.seconds, label: t("countdown.seconds", lang) },
  ];

  return (
    <div>
      <div className="mb-3 text-center text-sm tracking-wide opacity-70">
        {t("countdown.until", lang)}
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {cells.map((c) => (
          <div key={c.label} className="flex flex-col items-center">
            <div
              className="min-w-16 rounded-xl px-3 py-2.5 text-center text-2xl font-semibold tabular-nums shadow-sm sm:min-w-20 sm:text-3xl"
              style={{
                backgroundColor: "var(--c-surface)",
                color: "var(--c-text)",
                border: "1px solid color-mix(in srgb, var(--c-primary) 25%, transparent)",
              }}
            >
              {String(c.value).padStart(2, "0")}
            </div>
            <span className="mt-1.5 text-xs opacity-70">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
