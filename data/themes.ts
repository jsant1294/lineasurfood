export interface ThemeTokens {
  id: string;
  label_es: string;
  label_en: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  accent: string;
  badge: string;
  badgeText: string;
  border: string;
  heroOverlay: string;
  radius: string;
  font: string;
}

export const THEMES: Record<string, ThemeTokens> = {
  rojo: {
    id: "rojo",
    label_es: "Rojo Taquería",
    label_en: "Rojo Taquería",
    bg: "#1a0e0c",
    surface: "#2a1512",
    surfaceAlt: "#341915",
    text: "#fdf2ec",
    textMuted: "#d9a99a",
    primary: "#e23b2e",
    primaryHover: "#c22d22",
    primaryText: "#ffffff",
    accent: "#f6b93b",
    badge: "#f6b93b",
    badgeText: "#1a0e0c",
    border: "#4a221c",
    heroOverlay: "linear-gradient(180deg, rgba(26,14,12,0.2), rgba(26,14,12,0.92))",
    radius: "14px",
    font: "var(--font-sans)",
  },
  verde: {
    id: "verde",
    label_es: "Verde Tamal",
    label_en: "Verde Tamal",
    bg: "#0f1a10",
    surface: "#16261a",
    surfaceAlt: "#1d3122",
    text: "#f1f7ee",
    textMuted: "#a7c4a3",
    primary: "#3f8a4f",
    primaryHover: "#347141",
    primaryText: "#ffffff",
    accent: "#e7b84b",
    badge: "#e7b84b",
    badgeText: "#0f1a10",
    border: "#2a4530",
    heroOverlay: "linear-gradient(180deg, rgba(15,26,16,0.2), rgba(15,26,16,0.92))",
    radius: "12px",
    font: "var(--font-sans)",
  },
  dorado: {
    id: "dorado",
    label_es: "Dorado Premium",
    label_en: "Dorado Premium",
    bg: "#14110a",
    surface: "#1e1a10",
    surfaceAlt: "#272013",
    text: "#f7f1e3",
    textMuted: "#cbb88c",
    primary: "#c8a04e",
    primaryHover: "#b08a3d",
    primaryText: "#1a1408",
    accent: "#e9d4a1",
    badge: "#e9d4a1",
    badgeText: "#1a1408",
    border: "#3a3018",
    heroOverlay: "linear-gradient(180deg, rgba(20,17,10,0.15), rgba(20,17,10,0.9))",
    radius: "6px",
    font: "var(--font-serif)",
  },
  negro: {
    id: "negro",
    label_es: "Negro Food Truck",
    label_en: "Negro Food Truck",
    bg: "#0c0c0e",
    surface: "#16161a",
    surfaceAlt: "#1e1e24",
    text: "#f4f4f6",
    textMuted: "#9a9aa6",
    primary: "#ff5722",
    primaryHover: "#e64a18",
    primaryText: "#ffffff",
    accent: "#27e1c1",
    badge: "#27e1c1",
    badgeText: "#0c0c0e",
    border: "#2a2a32",
    heroOverlay: "linear-gradient(180deg, rgba(12,12,14,0.25), rgba(12,12,14,0.94))",
    radius: "10px",
    font: "var(--font-sans)",
  },
  azul: {
    id: "azul",
    label_es: "Azul Mariscos",
    label_en: "Azul Mariscos",
    bg: "#08161f",
    surface: "#0f2330",
    surfaceAlt: "#143041",
    text: "#eef8fb",
    textMuted: "#94bdcf",
    primary: "#1e90b8",
    primaryHover: "#19799b",
    primaryText: "#ffffff",
    accent: "#f4a83c",
    badge: "#f4a83c",
    badgeText: "#08161f",
    border: "#1c3d4f",
    heroOverlay: "linear-gradient(180deg, rgba(8,22,31,0.2), rgba(8,22,31,0.92))",
    radius: "14px",
    font: "var(--font-sans)",
  },
  rosa: {
    id: "rosa",
    label_es: "Rosa Panadería",
    label_en: "Rosa Panadería",
    bg: "#fdf4f0",
    surface: "#ffffff",
    surfaceAlt: "#fbe9e2",
    text: "#3a2420",
    textMuted: "#9c6f64",
    primary: "#d76e7e",
    primaryHover: "#c25868",
    primaryText: "#ffffff",
    accent: "#8a5a3c",
    badge: "#f4c8b0",
    badgeText: "#3a2420",
    border: "#f1d7cc",
    heroOverlay: "linear-gradient(180deg, rgba(253,244,240,0.1), rgba(253,244,240,0.85))",
    radius: "18px",
    font: "var(--font-serif)",
  },
};

export const THEME_LIST = Object.values(THEMES);

export function themeToCssVars(t: ThemeTokens): Record<string, string> {
  return {
    "--bg": t.bg,
    "--surface": t.surface,
    "--surface-alt": t.surfaceAlt,
    "--text": t.text,
    "--text-muted": t.textMuted,
    "--primary": t.primary,
    "--primary-hover": t.primaryHover,
    "--primary-text": t.primaryText,
    "--accent": t.accent,
    "--badge": t.badge,
    "--badge-text": t.badgeText,
    "--border": t.border,
    "--hero-overlay": t.heroOverlay,
    "--radius": t.radius,
    "--brand-font": t.font,
  };
}
