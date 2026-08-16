import { prisma } from "@/lib/prisma";
import { buildIcs } from "@/lib/calendar";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: { title: true, description: true, location: true, eventDate: true },
  });

  if (!invitation || !invitation.eventDate) {
    return new Response("Not found", { status: 404 });
  }

  const ics = buildIcs({
    title: invitation.title,
    description: invitation.description ?? "",
    location: invitation.location ?? "",
    start: invitation.eventDate,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
