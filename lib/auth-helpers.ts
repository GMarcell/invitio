import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

export async function optionalUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** True if the signed-in user owns the invitation or is an accepted collaborator. */
export async function canEditInvitation(invitationId: string, user: { id: string; email?: string | null }) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { collaborators: true },
  });
  if (!invitation) return false;
  if (invitation.ownerId === user.id) return true;
  return invitation.collaborators.some(
    (c) => c.email.toLowerCase() === user.email?.toLowerCase() && c.role !== "viewer",
  );
}

export async function requireEditAccess(invitationId: string) {
  const user = await requireUser();
  const ok = await canEditInvitation(invitationId, user);
  if (!ok) redirect("/dashboard");
  return user;
}
