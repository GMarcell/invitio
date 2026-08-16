"use client";

import { CATEGORIES } from "@/lib/templates";
import { Input, Label, Select, Textarea } from "@/components/ui";
import { TIMEZONES, type EditorForm } from "@/components/editor/types";

export function DetailsPanel({
  form,
  setForm,
}: {
  form: EditorForm;
  setForm: React.Dispatch<React.SetStateAction<EditorForm>>;
}) {
  function set<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Event title / names</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Raka & Aisyah"
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="e.g. The Wedding Celebration"
        />
      </div>

      <div>
        <Label htmlFor="category">Event type</Label>
        <Select id="category" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="eventDate">Date & time</Label>
          <Input
            id="eventDate"
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select id="timezone" value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g. Grand Ballroom, Ritz-Carlton Jakarta"
        />
      </div>

      <div>
        <Label htmlFor="locationLink">Map link (optional)</Label>
        <Input
          id="locationLink"
          value={form.locationLink}
          onChange={(e) => set("locationLink", e.target.value)}
          placeholder="https://maps.google.com/?q=..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dressCode">Dress code</Label>
          <Input
            id="dressCode"
            value={form.dressCode}
            onChange={(e) => set("dressCode", e.target.value)}
            placeholder="e.g. Formal / Semi-formal"
          />
        </div>
        <div>
          <Label htmlFor="rsvpDeadline">RSVP deadline</Label>
          <Input
            id="rsvpDeadline"
            type="datetime-local"
            value={form.rsvpDeadline}
            onChange={(e) => set("rsvpDeadline", e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="A warm note for your guests…"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="defaultLanguage">Default language</Label>
        <Select
          id="defaultLanguage"
          value={form.defaultLanguage}
          onChange={(e) => set("defaultLanguage", e.target.value as "en" | "id")}
        >
          <option value="en">English</option>
          <option value="id">Bahasa Indonesia</option>
        </Select>
        <p className="mt-1 text-xs text-zinc-400">
          Guests can switch languages with the toggle on the invitation page.
        </p>
      </div>
    </div>
  );
}
