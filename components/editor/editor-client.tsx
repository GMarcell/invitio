"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ExternalLink } from "lucide-react";
import { updateInvitation } from "@/app/actions/invitation-actions";
import { mergeTheme, type TemplateTheme } from "@/lib/templates";
import type { EditorInvitationData, QuestionDef, SerializedInvitation } from "@/lib/serialize";
import { cn } from "@/lib/utils";
import { InvitationView } from "@/components/invite/invitation-view";
import { Badge, Button, Spinner } from "@/components/ui";
import { DetailsPanel } from "@/components/editor/panels/details-panel";
import { DesignPanel } from "@/components/editor/panels/design-panel";
import { SectionsPanel } from "@/components/editor/panels/sections-panel";
import { GiftPanel } from "@/components/editor/panels/gift-panel";
import { SettingsPanel } from "@/components/editor/panels/settings-panel";
import { toLocalInputValue, type EditorForm, type EditorToggles } from "@/components/editor/types";

type Tab = "details" | "design" | "sections" | "gifts" | "settings";

const tabs: { key: Tab; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "design", label: "Design" },
  { key: "sections", label: "Sections" },
  { key: "gifts", label: "Gifts" },
  { key: "settings", label: "Settings" },
];

export function EditorClient({ data }: { data: EditorInvitationData }) {
  const [tab, setTab] = useState<Tab>("details");
  const [form, setForm] = useState<EditorForm>(() => ({
    title: data.title,
    subtitle: data.subtitle ?? "",
    description: data.description ?? "",
    category: data.category,
    eventDate: toLocalInputValue(data.eventDate),
    timezone: data.timezone,
    location: data.location ?? "",
    locationLink: data.locationLink ?? "",
    dressCode: data.dressCode ?? "",
    rsvpDeadline: toLocalInputValue(data.rsvpDeadline),
    defaultLanguage: data.defaultLanguage,
    slug: data.slug,
    accessCode: data.accessCode ?? "",
  }));
  const [theme, setTheme] = useState<TemplateTheme>(() =>
    mergeTheme(data.templateTheme, data.themeOverrides),
  );
  const [toggles, setToggles] = useState<EditorToggles>({
    showCountdown: data.showCountdown,
    showCalendar: data.showCalendar,
    showGuestbook: data.showGuestbook,
    showGift: data.showGift,
    hasMealOption: data.hasMealOption,
  });
  const [mealOptions, setMealOptions] = useState<string[]>(data.mealOptions);
  const [questions, setQuestions] = useState<QuestionDef[]>(data.customQuestions);
  const [enableReminders, setEnableReminders] = useState(data.enableReminders);
  const [reminderOffsetDays, setReminderOffsetDays] = useState(data.reminderOffsetDays);
  const [status, setStatus] = useState(data.status);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const previewData: SerializedInvitation = useMemo<SerializedInvitation>(
    () => ({
      id: data.id,
      slug: form.slug || data.slug,
      title: form.title || "Your Event Title",
      subtitle: form.subtitle || "You are invited",
      description: form.description || null,
      category: form.category,
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      timezone: form.timezone,
      location: form.location || null,
      locationLink: form.locationLink || null,
      dressCode: form.dressCode || null,
      rsvpDeadline: form.rsvpDeadline ? new Date(form.rsvpDeadline).toISOString() : null,
      accessCode: null,
      defaultLanguage: form.defaultLanguage,
      status: status === "active" ? "active" : "draft",
      showCountdown: toggles.showCountdown,
      showCalendar: toggles.showCalendar,
      showGuestbook: toggles.showGuestbook,
      showGift: toggles.showGift,
      hasMealOption: toggles.hasMealOption,
      mealOptions,
      customQuestions: questions,
      theme,
      template: data.template,
      giftAccounts: data.giftAccounts,
      messages: data.messages,
    }),
    [data, form, theme, toggles, mealOptions, questions, status],
  );

  async function save(nextStatus: string = status) {
    setSaving(true);
    setSaveState("idle");
    setSaveMsg("");

    const res = await updateInvitation(data.id, {
      title: form.title.trim() || "Untitled event",
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      category: form.category,
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      timezone: form.timezone || "UTC",
      location: form.location.trim() || null,
      locationLink: form.locationLink.trim() || null,
      dressCode: form.dressCode.trim() || null,
      rsvpDeadline: form.rsvpDeadline ? new Date(form.rsvpDeadline).toISOString() : null,
      accessCode: form.accessCode.trim() || null,
      defaultLanguage: form.defaultLanguage,
      slug: form.slug.trim().toLowerCase() || data.slug,
      theme,
      showCountdown: toggles.showCountdown,
      showCalendar: toggles.showCalendar,
      showGuestbook: toggles.showGuestbook,
      showGift: toggles.showGift,
      hasMealOption: toggles.hasMealOption,
      mealOptions,
      customQuestions: questions,
      enableReminders,
      reminderOffsetDays,
      status: nextStatus as "draft" | "active" | "past",
    });

    setSaving(false);
    if (res?.error) {
      setSaveState("error");
      setSaveMsg(res.error);
    } else {
      setSaveState("saved");
      setSaveMsg(nextStatus === "active" ? "Saved & published ✓" : "Saved ✓");
      setStatus(nextStatus as "draft" | "active" | "past");
      if (res.slug) setForm((f) => ({ ...f, slug: res.slug }));
    }
  }

  function publish() {
    void save("active");
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <ChevronLeft className="h-4 w-4" /> Dashboard
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">{form.title || "Untitled"}</h1>
            <div className="flex items-center gap-2">
              <Badge tone={status === "active" ? "green" : status === "past" ? "zinc" : "amber"}>
                {status === "active" ? "Published" : status === "past" ? "Past" : "Draft"}
              </Badge>
              {status === "active" && (
                <a
                  href={`/i/${form.slug || data.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View live page
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveState === "saved" && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" /> {saveMsg}
            </span>
          )}
          {saveState === "error" && <span className="text-sm font-medium text-red-600">{saveMsg}</span>}
          <Button variant="outline" onClick={() => save()} disabled={saving}>
            {saving && <Spinner />} Save
          </Button>
          {status !== "active" ? (
            <Button onClick={publish} disabled={saving}>
              {saving && <Spinner />} Publish
            </Button>
          ) : (
            <Button variant="outline" onClick={() => save("draft")} disabled={saving}>
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left: panels */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === t.key ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            {tab === "details" && <DetailsPanel form={form} setForm={setForm} />}
            {tab === "design" && (
              <DesignPanel theme={theme} setTheme={setTheme} templateTheme={data.templateTheme} />
            )}
            {tab === "sections" && (
              <SectionsPanel
                toggles={toggles}
                setToggles={setToggles}
                mealOptions={mealOptions}
                setMealOptions={setMealOptions}
                questions={questions}
                setQuestions={setQuestions}
              />
            )}
            {tab === "gifts" && (
              <GiftPanel invitationId={data.id} giftAccounts={data.giftAccounts} />
            )}
            {tab === "settings" && (
              <SettingsPanel
                form={form}
                setForm={setForm}
                status={status}
                onPublish={() => publish()}
                collaborators={data.collaborators}
                invitationId={data.id}
                enableReminders={enableReminders}
                setEnableReminders={setEnableReminders}
                reminderOffsetDays={reminderOffsetDays}
                setReminderOffsetDays={setReminderOffsetDays}
              />
            )}
          </div>
        </div>

        {/* Right: live preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-500">Live preview</p>
            <p className="text-xs text-zinc-400">Shown on desktop & mobile</p>
          </div>
          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[2rem] border-8 border-zinc-900 bg-zinc-900 shadow-2xl">
              <div className="no-scrollbar h-[720px] overflow-y-auto">
                <InvitationView data={previewData} mode="preview" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
