import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/templates";
import { AppHeader } from "@/components/site/app-header";
import { TemplateCard } from "@/components/templates/template-card";

export const metadata: Metadata = { title: "Templates" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await requireUser();
  const templates = await prisma.template.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const categories = [
    { value: "all", label: "All" },
    ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  ];

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50">
      <AppHeader name={user.name ?? "Host"} email={user.email ?? ""} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Choose a template</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Pick a starting point — you can customize everything afterward.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.value}
              href={c.value === "all" ? "/templates" : `/templates?category=${c.value}`}
              className="rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-600 hover:border-rose-400 hover:text-rose-600"
            >
              {c.label}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
        </div>
      </main>
    </div>
  );
}
