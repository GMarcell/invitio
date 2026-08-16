import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireEditAccess } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { serializeEditorInvitation } from "@/lib/serialize";
import { AppHeader } from "@/components/site/app-header";
import { EditorClient } from "@/components/editor/editor-client";

export const metadata: Metadata = { title: "Edit invitation" };
export const dynamic = "force-dynamic";

export default async function EditInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireEditAccess(id);

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      template: true,
      giftAccounts: { orderBy: { sortOrder: "asc" } },
      collaborators: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!invitation) notFound();

  const data = serializeEditorInvitation(invitation);

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50">
      <AppHeader name={user.name ?? "Host"} email={user.email ?? ""} />
      <EditorClient data={data} />
    </div>
  );
}
