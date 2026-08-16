// Template catalog. Seeded into the database; also used as the default theme
// source so invitation rendering works even before seeding.

export type TemplateStyle = "elegant" | "modern" | "playful" | "classic" | "corporate";
export type Deco = "floral" | "dots" | "lines" | "stars" | "minimal" | "confetti";

export type TemplateTheme = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
  };
  fonts: {
    heading: string;
    body: string;
    script?: string;
  };
  style: TemplateStyle;
  deco: Deco;
};

export const FONT_OPTIONS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Great Vibes",
  "Dancing Script",
  "Montserrat",
  "Poppins",
  "Lora",
] as const;

export const CATEGORIES = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "corporate", label: "Corporate" },
  { value: "holiday", label: "Holiday" },
  { value: "generic", label: "Other" },
] as const;

export type TemplateDef = {
  slug: string;
  name: string;
  category: (typeof CATEGORIES)[number]["value"];
  description: string;
  emoji: string;
  gradient: string;
  isPremium: boolean;
  theme: TemplateTheme;
};

export const TEMPLATES: TemplateDef[] = [
  {
    slug: "classic-wedding",
    name: "Classic Wedding",
    category: "wedding",
    description: "Timeless serif elegance with warm gold accents for formal ceremonies.",
    emoji: "💍",
    gradient: "linear-gradient(135deg, #f5efe0 0%, #e8d9b5 50%, #c9a86a 100%)",
    isPremium: false,
    theme: {
      colors: {
        primary: "#b8860b",
        secondary: "#f5efe0",
        accent: "#8a5a2b",
        bg: "#fdfaf3",
        surface: "#ffffff",
        text: "#3b2f2f",
        muted: "#8a7a6a",
      },
      fonts: { heading: "Playfair Display", body: "Cormorant Garamond", script: "Great Vibes" },
      style: "elegant",
      deco: "floral",
    },
  },
  {
    slug: "modern-minimal",
    name: "Modern Minimal",
    category: "generic",
    description: "Clean sans-serif lines, bold type and generous whitespace.",
    emoji: "◻️",
    gradient: "linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)",
    isPremium: false,
    theme: {
      colors: {
        primary: "#111827",
        secondary: "#f3f4f6",
        accent: "#ef4444",
        bg: "#fafafa",
        surface: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
      },
      fonts: { heading: "Montserrat", body: "Montserrat" },
      style: "modern",
      deco: "minimal",
    },
  },
  {
    slug: "floral-romance",
    name: "Floral Romance",
    category: "wedding",
    description: "Soft blush tones with flowing script for romantic celebrations.",
    emoji: "🌷",
    gradient: "linear-gradient(135deg, #fdeef2 0%, #f6cdd9 60%, #e8a7bb 100%)",
    isPremium: true,
    theme: {
      colors: {
        primary: "#c2577c",
        secondary: "#fdeef2",
        accent: "#8f3f5e",
        bg: "#fff8fa",
        surface: "#ffffff",
        text: "#4a2b36",
        muted: "#a37b88",
      },
      fonts: { heading: "Playfair Display", body: "Lora", script: "Dancing Script" },
      style: "elegant",
      deco: "floral",
    },
  },
  {
    slug: "birthday-bash",
    name: "Birthday Bash",
    category: "birthday",
    description: "Vibrant, playful and full of energy — perfect for parties.",
    emoji: "🎉",
    gradient: "linear-gradient(135deg, #fff3b0 0%, #ffd166 50%, #f4845f 100%)",
    isPremium: false,
    theme: {
      colors: {
        primary: "#e63946",
        secondary: "#ffd166",
        accent: "#f4845f",
        bg: "#fffaf0",
        surface: "#ffffff",
        text: "#2b2d42",
        muted: "#6d6f8a",
      },
      fonts: { heading: "Poppins", body: "Poppins" },
      style: "playful",
      deco: "confetti",
    },
  },
  {
    slug: "kids-party",
    name: "Kids Party",
    category: "birthday",
    description: "Bright blues and cheerful shapes for little ones' big days.",
    emoji: "🎈",
    gradient: "linear-gradient(135deg, #d0f4de 0%, #a9def9 50%, #8ac6f0 100%)",
    isPremium: false,
    theme: {
      colors: {
        primary: "#1d4ed8",
        secondary: "#a9def9",
        accent: "#f472b6",
        bg: "#f0fbff",
        surface: "#ffffff",
        text: "#1e293b",
        muted: "#64748b",
      },
      fonts: { heading: "Poppins", body: "Poppins" },
      style: "playful",
      deco: "dots",
    },
  },
  {
    slug: "baby-shower",
    name: "Baby Shower",
    category: "baby_shower",
    description: "Soft pastels and gentle serif — sweet anticipation.",
    emoji: "🍼",
    gradient: "linear-gradient(135deg, #e0f2fe 0%, #fae8ff 60%, #fbcfe8 100%)",
    isPremium: false,
    theme: {
      colors: {
        primary: "#7c3aed",
        secondary: "#ede9fe",
        accent: "#db2777",
        bg: "#fdfbff",
        surface: "#ffffff",
        text: "#3b3b4f",
        muted: "#8b8ba3",
      },
      fonts: { heading: "Lora", body: "Lora", script: "Dancing Script" },
      style: "elegant",
      deco: "stars",
    },
  },
  {
    slug: "corporate-event",
    name: "Corporate Event",
    category: "corporate",
    description: "Professional navy palette for webinars, launches and conferences.",
    emoji: "💼",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    isPremium: true,
    theme: {
      colors: {
        primary: "#1d4ed8",
        secondary: "#eff6ff",
        accent: "#f59e0b",
        bg: "#f8fafc",
        surface: "#ffffff",
        text: "#0f172a",
        muted: "#64748b",
      },
      fonts: { heading: "Montserrat", body: "Montserrat" },
      style: "corporate",
      deco: "lines",
    },
  },
  {
    slug: "holiday-festive",
    name: "Holiday Festive",
    category: "holiday",
    description: "Deep greens and gold for Christmas, New Year and seasonal gatherings.",
    emoji: "🎄",
    gradient: "linear-gradient(135deg, #14532d 0%, #15803d 60%, #d4a017 100%)",
    isPremium: false,
    theme: {
      colors: {
        primary: "#15803d",
        secondary: "#dcfce7",
        accent: "#d4a017",
        bg: "#f7fdf8",
        surface: "#ffffff",
        text: "#1c2b22",
        muted: "#5f7468",
      },
      fonts: { heading: "Playfair Display", body: "Lora" },
      style: "classic",
      deco: "stars",
    },
  },
];

export function defaultThemeForCategory(
  category: string,
): TemplateTheme {
  const tpl = TEMPLATES.find((t) => t.category === category) ?? TEMPLATES[0];
  return tpl.theme;
}

export function mergeTheme(base: TemplateTheme | null | undefined, overrides: Partial<TemplateTheme> | null | undefined): TemplateTheme {
  const merged: TemplateTheme = {
    colors: { ...(base?.colors ?? defaultThemeForCategory("generic").colors), ...overrides?.colors },
    fonts: { ...(base?.fonts ?? defaultThemeForCategory("generic").fonts), ...overrides?.fonts },
    style: overrides?.style ?? base?.style ?? "modern",
    deco: overrides?.deco ?? base?.deco ?? "minimal",
  };
  return merged;
}

export function themeForInvitation(invitation: {
  category?: string | null;
  template?: { theme: unknown } | null;
  theme?: unknown;
}): TemplateTheme {
  const templateTheme = invitation.template?.theme as TemplateTheme | null | undefined;
  const inviteTheme = invitation.theme as TemplateTheme | null | undefined;
  const base = templateTheme ?? defaultThemeForCategory(invitation.category ?? "generic");
  return mergeTheme(base, inviteTheme);
}
