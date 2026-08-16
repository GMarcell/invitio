import Link from "next/link";
import { CalendarHeart, HeartHandshake, Palette, Share2, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { optionalUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await optionalUser();
  const templates = await prisma.template.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
  });

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Invitio<span className="text-rose-600">.</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/templates" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Templates
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
              >
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 text-center">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
          <Sparkles className="h-3.5 w-3.5" />
          Beautiful invitations in under 10 minutes
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          Design, share & track
          <span className="block bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
            digital invitations
          </span>
          without design skills
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-500">
          Pick a template, customize colors and text, share a link on WhatsApp or email — and
          watch RSVPs roll in. No apps to install, no design experience needed.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={user ? "/templates" : "/signup"}
            className="rounded-xl bg-rose-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Create your invitation
          </Link>
          <Link
            href="/templates"
            className="rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Browse templates
          </Link>
        </div>
        <p className="mt-4 text-xs text-zinc-400">
          Free forever plan · No credit card required · Guests don&apos;t need an account
        </p>
      </section>

      {/* ── Template showcase ───────────────────────────── */}
      <section className="border-y border-zinc-100 bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
            Start from a stunning template
          </h2>
          <p className="mt-2 text-center text-zinc-500">
            Weddings, birthdays, baby showers, corporate events and more.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {templates.map((tpl) => (
              <Link
                key={tpl.id}
                href={user ? "/templates" : "/signup"}
                className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div
                  className="flex h-28 items-center justify-center text-4xl"
                  style={{ background: String(tpl.gradient ?? "#e5e7eb") }}
                >
                  <span className="drop-shadow-sm">{tpl.emoji}</span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-rose-600">
                    {tpl.name}
                  </p>
                  <p className="text-xs text-zinc-400 capitalize">{tpl.category.replace("_", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
          Three steps to a perfect invite
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: <Palette className="h-5 w-5" />,
              title: "1. Customize",
              body: "Pick a template, then edit text, colors and fonts with a live preview.",
            },
            {
              icon: <Share2 className="h-5 w-5" />,
              title: "2. Share",
              body: "Send the link via WhatsApp, email or QR code. Guests don't need an account.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "3. Track RSVPs",
              body: "See who's coming in real time, export to CSV, and send reminders.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                {s.icon}
              </div>
              <h3 className="font-semibold text-zinc-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ────────────────────────────────── */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <CalendarHeart className="h-5 w-5" />,
              title: "Countdown & calendar",
              body: "Guests see a live countdown and can add the event to Google Calendar or Outlook in one tap.",
            },
            {
              icon: <HeartHandshake className="h-5 w-5" />,
              title: "Gifts & e-wallet details",
              body: "Share bank or QRIS details with masked, tap-to-reveal account numbers — shown only to invitees.",
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Guestbook & wishes",
              body: "Guests leave wishes on the invitation page; the host sees every message in one place.",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "Guest list import & export",
              body: "Upload a CSV of guests, track who hasn't responded, and export everything back to CSV.",
            },
            {
              icon: <Share2 className="h-5 w-5" />,
              title: "Built for WhatsApp",
              body: "Polished link previews, one-tap sharing and a QR code for printed invitations.",
            },
            {
              icon: <Palette className="h-5 w-5" />,
              title: "Bilingual invitations",
              body: "One link serves mixed guest lists with an English / Bahasa Indonesia toggle.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
                {f.icon}
              </div>
              <h3 className="font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 px-6 py-12 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-white">Ready to invite?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">
            Create your first invitation now — it takes less than 10 minutes.
          </p>
          <Link
            href={user ? "/templates" : "/signup"}
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-zinc-400 sm:flex-row">
          <p className="font-bold text-zinc-700">
            Invitio<span className="text-rose-600">.</span>
          </p>
          <p>© {new Date().getFullYear()} Invitio. Beautiful invitations for every occasion.</p>
        </div>
      </footer>
    </div>
  );
}
