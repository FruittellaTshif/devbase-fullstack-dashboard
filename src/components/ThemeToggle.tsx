/**
 * ThemeToggle.tsx
 * -------------------------------------------------------
 * Bouton pour basculer entre "dark" et "light" (Mantine).
 *
 * - Thème supporté : ThemeName = "dark" | "light"
 * - Le composant reste simple (UI type "icon button")
 */

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "../lib/theme";
import type { ThemeName } from "../lib/theme";

type Props = {
  theme: ThemeName;
  onChange: (next: ThemeName) => void;
};

export default function ThemeToggle({ theme, onChange }: Props) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-label="Toggle theme"
      title={isDark ? "Passer en light" : "Passer en dark"}
      onClick={() => onChange(toggleTheme(theme))}
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
