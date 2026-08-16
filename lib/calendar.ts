import { toCalendarStamp } from "@/lib/utils";

const EVENT_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 300);
}

export function googleCalendarUrl(opts: { title: string; description: string; location: string; start: Date }) {
  const end = new Date(opts.start.getTime() + EVENT_DURATION_MS);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toCalendarStamp(opts.start)}/${toCalendarStamp(end)}`,
    details: stripTags(opts.description),
    location: opts.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(opts: { title: string; description: string; location: string; start: Date }) {
  const end = new Date(opts.start.getTime() + EVENT_DURATION_MS);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: opts.title,
    startdt: toCalendarStamp(opts.start),
    enddt: toCalendarStamp(end),
    location: opts.location,
    body: stripTags(opts.description),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

export function buildIcs(opts: { title: string; description: string; location: string; start: Date }) {
  const end = new Date(opts.start.getTime() + EVENT_DURATION_MS);
  const uid = `${opts.start.getTime()}-invitio`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitio//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(opts.start)}`,
    `DTEND:${toCalendarStamp(end)}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    `DESCRIPTION:${escapeIcs(stripTags(opts.description))}`,
    `LOCATION:${escapeIcs(opts.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function escapeIcs(text: string): string {
  return text.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
}
