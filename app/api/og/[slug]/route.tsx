import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { themeForInvitation } from "@/lib/templates";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { template: true },
  });
  if (!invitation) return new Response("Not found", { status: 404 });

  const theme = themeForInvitation(invitation);
  const c = theme.colors;

  const eventLine = invitation.eventDate
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(invitation.eventDate)
    : invitation.subtitle ?? "You are invited";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(150deg, ${c.primary} 0%, ${c.secondary} 100%)`,
          color: c.bg,
          padding: 48,
        }}
      >
        <div style={{ display: "flex", fontSize: 40, marginBottom: 16 }}>💌</div>
        <div style={{ fontSize: 76, fontWeight: 700, textAlign: "center", letterSpacing: 1 }}>
          {invitation.title}
        </div>
        <div style={{ fontSize: 34, marginTop: 20, textAlign: "center", opacity: 0.95 }}>
          {eventLine}
        </div>
        <div style={{ fontSize: 26, marginTop: 44, opacity: 0.8 }}>invitio.app</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
