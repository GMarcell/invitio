"use client";

import { Plus, X } from "lucide-react";
import { Input, Toggle } from "@/components/ui";
import type { EditorToggles } from "@/components/editor/types";
import type { QuestionDef } from "@/lib/serialize";

export function SectionsPanel({
  toggles,
  setToggles,
  mealOptions,
  setMealOptions,
  questions,
  setQuestions,
}: {
  toggles: EditorToggles;
  setToggles: React.Dispatch<React.SetStateAction<EditorToggles>>;
  mealOptions: string[];
  setMealOptions: React.Dispatch<React.SetStateAction<string[]>>;
  questions: QuestionDef[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDef[]>>;
}) {
  function toggle(key: keyof EditorToggles) {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900">Show on the invitation</h3>
        <div className="space-y-3">
          {(
            [
              ["showCountdown", "Countdown timer", "Live countdown to the event date"],
              ["showCalendar", "Add to Calendar", "Google Calendar, Outlook and .ics download"],
              ["showGuestbook", "Guestbook wishes", "Guests can leave messages on the page"],
              ["showGift", "Gift section", "Bank / e-wallet details for monetary gifts"],
              ["showGallery", "Photo gallery", "Show event photos on the invitation page"],
              ["allowGuestPhotos", "Guest photo uploads", "Guests can share their own photos (needs the gallery on)"],
            ] as const
          ).map(([key, label, hint]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-zinc-800">{label}</p>
                <p className="text-xs text-zinc-400">{hint}</p>
              </div>
              <Toggle checked={toggles[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Meal options</h3>
            <p className="text-xs text-zinc-400">
              Guests pick one when RSVPing. Toggle the switch to enable.
            </p>
          </div>
          <Toggle checked={toggles.hasMealOption} onChange={() => toggle("hasMealOption")} />
        </div>
        {toggles.hasMealOption && (
          <div className="space-y-2">
            {mealOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) =>
                    setMealOptions((opts) => opts.map((o, idx) => (idx === i ? e.target.value : o)))
                  }
                  placeholder="e.g. Grilled Salmon"
                />
                <button
                  onClick={() => setMealOptions((opts) => opts.filter((_, idx) => idx !== i))}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setMealOptions((opts) => [...opts, ""])}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-500 hover:border-rose-400 hover:text-rose-600"
            >
              <Plus className="h-4 w-4" /> Add option
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100 pt-5">
        <h3 className="mb-1 text-sm font-semibold text-zinc-900">Custom RSVP questions</h3>
        <p className="mb-2 text-xs text-zinc-400">
          Ask guests anything — e.g. dietary restrictions or arrival time.
        </p>
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="flex items-center gap-2">
              <Input
                value={q.label}
                onChange={(e) =>
                  setQuestions((qs) =>
                    qs.map((x) => (x.id === q.id ? { ...x, label: e.target.value } : x)),
                  )
                }
                placeholder="Question text"
              />
              <label className="flex shrink-0 items-center gap-1 text-xs text-zinc-500">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) =>
                    setQuestions((qs) =>
                      qs.map((x) => (x.id === q.id ? { ...x, required: e.target.checked } : x)),
                    )
                  }
                  className="h-4 w-4 accent-rose-600"
                />
                Required
              </label>
              <button
                onClick={() => setQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setQuestions((qs) => [
                ...qs,
                { id: crypto.randomUUID(), label: "", required: false },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-500 hover:border-rose-400 hover:text-rose-600"
          >
            <Plus className="h-4 w-4" /> Add question
          </button>
        </div>
      </div>
    </div>
  );
}
