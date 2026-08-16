// Fonts are loaded from the Google Fonts CDN via <link> tags in the root layout
// (see app/layout.tsx). This avoids build-time font downloads and keeps the
// invitation page fast. Names here must match the families loaded there.

export const FONT_FAMILY_STACKS: Record<string, string> = {
  "Playfair Display": "'Playfair Display', Georgia, serif",
  "Cormorant Garamond": "'Cormorant Garamond', Georgia, serif",
  "Great Vibes": "'Great Vibes', 'Brush Script MT', cursive",
  "Dancing Script": "'Dancing Script', 'Brush Script MT', cursive",
  "Montserrat": "'Montserrat', 'Segoe UI', system-ui, sans-serif",
  "Poppins": "'Poppins', 'Segoe UI', system-ui, sans-serif",
  "Lora": "'Lora', Georgia, serif",
};

export function fontFamily(name: string | undefined): string {
  if (!name) return "system-ui, sans-serif";
  return FONT_FAMILY_STACKS[name] ?? "system-ui, sans-serif";
}
