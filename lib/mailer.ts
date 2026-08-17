// Transactional email helper.
//
// Uses Resend when RESEND_API_KEY is set (https://resend.com — free tier available).
// Without a key it logs the email to the console so flows can be developed locally.

type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

/** Escape user-controlled text before embedding it in email HTML. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail({ to, subject, html }: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[mailer:dry-run] To: ${to} | Subject: ${subject}`);
    return { ok: true, dryRun: true } as const;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Invitio <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error(`[mailer:error] ${res.status} ${await res.text()}`);
    return { ok: false, dryRun: false } as const;
  }

  return { ok: true, dryRun: false } as const;
}

export function rsvpConfirmationHtml(invitationTitle: string, status: string): string {
  const label =
    status === "yes"
      ? "attending 🎉"
      : status === "maybe"
        ? "maybe attending 🤔"
        : "unable to attend 😢";
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">RSVP received — ${escapeHtml(invitationTitle)}</h2>
      <p>Thanks for responding! We've recorded that you are <strong>${label}</strong>.</p>
      <p style="color: #6b7280; font-size: 14px;">You can update your response anytime by opening the invitation link again.</p>
    </div>
  `;
}

export function reminderEmailHtml(opts: {
  name: string;
  title: string;
  link: string;
  deadline: Date;
}): string {
  const deadline = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(opts.deadline);

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">Friendly reminder — ${escapeHtml(opts.title)}</h2>
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>We haven't heard from you yet! Please let us know if you can make it to
         <strong>${escapeHtml(opts.title)}</strong> by <strong>${deadline}</strong>.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(opts.link)}" style="background-color: #e11d48; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Respond to your invitation
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px;">If you've already responded, please ignore this email.</p>
    </div>
  `;
}

export function hostRsvpNotificationHtml(invitationTitle: string, name: string, status: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">New RSVP — ${escapeHtml(invitationTitle)}</h2>
      <p><strong>${escapeHtml(name)}</strong> responded: <strong>${escapeHtml(status)}</strong></p>
      <p style="color: #6b7280; font-size: 14px;">View the full list in your Invitio dashboard.</p>
    </div>
  `;
}
