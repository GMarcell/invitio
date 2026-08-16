"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { verifyAccessCode } from "@/app/actions/guest-actions";
import { t, type Lang } from "@/lib/i18n";

export function LockGate({ slug, lang }: { slug: string; lang: Lang }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const res = await verifyAccessCode(slug, String(formData.get("code") ?? ""));
      if (res?.ok) {
        router.refresh();
        return null;
      }
      return { error: res?.error ?? t("lock.error", lang) };
    },
    null,
  );

  return (
    <div className="flex min-h-svh items-center justify-center px-4" style={{ backgroundColor: "var(--c-bg)", color: "var(--c-text)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center shadow-lg"
        style={{ backgroundColor: "var(--c-surface)", border: "1px solid color-mix(in srgb, var(--c-primary) 20%, transparent)" }}
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: "var(--c-primary)" }}
        >
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">{t("lock.title", lang)}</h1>
        <p className="mt-1 text-sm opacity-60">{t("lock.subtitle", lang)}</p>

        <form action={action} className="mt-6 space-y-3">
          <input
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("lock.input", lang)}
            className="w-full rounded-xl border px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--c-bg)",
              color: "var(--c-text)",
              borderColor: "color-mix(in srgb, var(--c-primary) 30%, transparent)",
            }}
          />
          {state?.error && (
            <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "color-mix(in srgb, #ef4444 12%, transparent)", color: "#b91c1c" }}>
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "var(--c-primary)" }}
          >
            {pending ? "…" : t("lock.submit", lang)}
          </button>
        </form>
      </div>
    </div>
  );
}
