import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { serializeInvitation } from "@/lib/serialize";
import { InvitationView } from "@/components/invite/invitation-view";
import { LockGate } from "@/components/invite/lock-gate";
import { hasAccessToSlug } from "@/app/actions/guest-actions";
import { optionalUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function getInvitation(slug: string) {
  return prisma.invitation.findUnique({
    where: { slug },
    include: {
      template: true,
      giftAccounts: { orderBy: { sortOrder: "asc" } },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation) return { title: "Invitation not found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const title = `${invitation.title}${invitation.subtitle ? ` — ${invitation.subtitle}` : ""}`;

  return {
    title,
    description: invitation.description?.slice(0, 160) ?? "You're invited — view the invitation and RSVP.",
    robots: { index: false, follow: false }, // keep invitation pages out of search engines
    openGraph: {
      title,
      description: invitation.description?.slice(0, 160) ?? "View the invitation and RSVP.",
      type: "website",
      url: `${baseUrl}/i/${invitation.slug}`,
      siteName: "Invitio",
      // WhatsApp/chat link previews render a colored card even without an image
      images: [
        {
          url: `${baseUrl}/api/og/${invitation.slug}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: invitation.description?.slice(0, 160) ?? "View the invitation and RSVP.",
    },
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation || invitation.status === "draft") notFound();

  const data = serializeInvitation(invitation);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Access-code protection
  if (invitation.accessCode) {
    const allowed = await hasAccessToSlug(slug);
    if (!allowed) {
      return <LockGate slug={slug} lang={data.defaultLanguage} />;
    }
  }

  // Generate QR codes server-side (gift account numbers + share link)
  const giftQrs: Record<string, string> = {};
  if (data.showGift) {
    for (const acc of data.giftAccounts) {
      try {
        giftQrs[acc.id] = await QRCode.toDataURL(acc.accountNumber, {
          width: 240,
          margin: 1,
          errorCorrectionLevel: "M",
        });
      } catch {
        /* skip QR on failure */
      }
    }
  }

  let linkQr: string | null = null;
  try {
    linkQr = await QRCode.toDataURL(`${baseUrl}/i/${slug}`, { width: 320, margin: 1 });
  } catch {
    linkQr = null;
  }

  const user = await optionalUser();
  const isOwner = user?.id === invitation.ownerId;

  return (
    <InvitationView
      data={data}
      mode="live"
      isOwner={isOwner}
      giftQrs={giftQrs}
      linkQr={linkQr}
      baseUrl={baseUrl}
    />
  );
}
