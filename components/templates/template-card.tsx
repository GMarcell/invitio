"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInvitation } from "@/app/actions/invitation-actions";
import { Badge, Spinner } from "@/components/ui";

type TemplateData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  emoji: string | null;
  gradient: string | null;
  isPremium: boolean;
};

export function TemplateCard({ template }: { template: TemplateData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function useTemplate() {
    startTransition(async () => {
      await createInvitation(template.id); // redirects to the editor
      router.refresh();
    });
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <div
        className="relative flex h-36 items-center justify-center text-5xl"
        style={{ background: template.gradient ?? "#e5e7eb" }}
      >
        <span className="drop-shadow">{template.emoji}</span>
        {template.isPremium && (
          <span className="absolute right-2 top-2">
            <Badge tone="amber">Premium</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">{template.name}</h3>
          <span className="text-xs capitalize text-zinc-400">{template.category.replace("_", " ")}</span>
        </div>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{template.description}</p>
        <button
          onClick={useTemplate}
          disabled={pending}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
        >
          {pending && <Spinner />}
          Use this template
        </button>
      </div>
    </div>
  );
}
