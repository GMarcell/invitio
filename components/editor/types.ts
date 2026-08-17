export type EditorForm = {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  eventDate: string; // datetime-local value
  timezone: string;
  location: string;
  locationLink: string;
  dressCode: string;
  rsvpDeadline: string; // datetime-local value
  defaultLanguage: "en" | "id";
  slug: string;
  accessCode: string;
};

export type EditorToggles = {
  showCountdown: boolean;
  showCalendar: boolean;
  showGuestbook: boolean;
  showGift: boolean;
  showGallery: boolean;
  allowGuestPhotos: boolean;
  hasMealOption: boolean;
};

export const TIMEZONES = [
  "UTC",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Bangkok",
  "Asia/Manila",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Hong_Kong",
  "Asia/Dubai",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Africa/Lagos",
  "Africa/Nairobi",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Pacific/Auckland",
] as const;

export function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
