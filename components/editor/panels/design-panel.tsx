"use client";

import { RotateCcw } from "lucide-react";
import { FONT_OPTIONS, type TemplateTheme } from "@/lib/templates";
import { Button, Label, Select } from "@/components/ui";

const colorFields: { key: keyof TemplateTheme["colors"]; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "bg", label: "Background" },
  { key: "surface", label: "Cards" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted text" },
];

export function DesignPanel({
  theme,
  setTheme,
  templateTheme,
}: {
  theme: TemplateTheme;
  setTheme: React.Dispatch<React.SetStateAction<TemplateTheme>>;
  templateTheme: TemplateTheme;
}) {
  function setColor(key: keyof TemplateTheme["colors"], value: string) {
    setTheme((t) => ({ ...t, colors: { ...t.colors, [key]: value } }));
  }

  function setFont(key: keyof TemplateTheme["fonts"], value: string) {
    setTheme((t) => ({ ...t, fonts: { ...t.fonts, [key]: value } }));
  }

  const isDirty = JSON.stringify(theme) !== JSON.stringify(templateTheme);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Colors</h3>
        {isDirty && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTheme(structuredClone(templateTheme))}
            className="text-rose-600"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to template
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {colorFields.map((f) => (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.colors[f.key]}
                onChange={(e) => setColor(f.key, e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-md border border-zinc-300 bg-white p-1"
              />
              <span className="font-mono text-xs text-zinc-500">{theme.colors[f.key]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Fonts</h3>
        <div className="space-y-3">
          <div>
            <Label>Heading font</Label>
            <Select
              value={theme.fonts.heading}
              onChange={(e) => setFont("heading", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Body font</Label>
            <Select value={theme.fonts.body} onChange={(e) => setFont("body", e.target.value)}>
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Script / accent font</Label>
            <Select
              value={theme.fonts.script ?? "Great Vibes"}
              onChange={(e) => setFont("script", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500">
        Style preview:{" "}
        <span style={{ fontFamily: "var(--c-font-heading, inherit)" }} className="text-sm font-semibold">
          {theme.fonts.heading}
        </span>{" "}
        for headings and{" "}
        <span style={{ fontFamily: "var(--c-font-body, inherit)" }}>{theme.fonts.body}</span> for body
        text.
      </div>
    </div>
  );
}
