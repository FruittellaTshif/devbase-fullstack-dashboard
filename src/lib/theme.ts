/**
 * theme.ts
 * -------------------------------------------------------
 * Gestion du thème (Mantine)
 * - Persistance localStorage
 * - Event custom pour mise à jour instantanée
 */

export type ThemeName = "dark" | "light";

/** Clé localStorage unique pour le thème */
export const THEME_STORAGE_KEY = "devbase_theme";

/** Event custom dispatché quand le thème change */
export const THEME_EVENT_NAME = "devbase:theme";

export function isThemeName(v: unknown): v is ThemeName {
  return v === "dark" || v === "light";
}

export function getStoredTheme(): ThemeName | null {
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeName(v) ? v : null;
}

export function resolveInitialTheme(): ThemeName {
  const stored = getStoredTheme();
  if (stored) return stored;

  if (typeof window !== "undefined" && window.matchMedia) {
    const prefersLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    return prefersLight ? "light" : "dark";
  }

  return "dark";
}

export function storeTheme(theme: ThemeName): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function setTheme(theme: ThemeName): void {
  storeTheme(theme);
  window.dispatchEvent(
    new CustomEvent<ThemeName>(THEME_EVENT_NAME, { detail: theme }),
  );
}

export function getTheme(): ThemeName {
  return getStoredTheme() ?? resolveInitialTheme();
}

export function toggleTheme(current: ThemeName): ThemeName {
  return current === "dark" ? "light" : "dark";
}

export function onThemeChange(cb: (theme: ThemeName) => void): () => void {
  const handler = (e: Event) => {
    const ev = e as CustomEvent<ThemeName>;
    if (isThemeName(ev.detail)) cb(ev.detail);
  };

  window.addEventListener(THEME_EVENT_NAME, handler);
  return () => window.removeEventListener(THEME_EVENT_NAME, handler);
}
