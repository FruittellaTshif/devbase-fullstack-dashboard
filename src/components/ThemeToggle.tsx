/**
 * ThemeToggle.tsx
 * -------------------------------------------------------
 * Petit bouton pour basculer entre "night" et "dark".
 */

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "../lib/theme";
import type { ThemeName } from "../lib/theme";

type Props = {
  theme: ThemeName;
  onChange: (next: ThemeName) => void;
};

export default function ThemeToggle({ theme, onChange }: Props) {
  const isNight = theme === "night";

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-label="Toggle theme"
      title={isNight ? "Passer en dark" : "Passer en night"}
      onClick={() => onChange(toggleTheme(theme))}
    >
      {isNight ? <Moon size={18} /> : <Sun size={18} />}
      <span className="hidden sm:inline">{isNight ? "Night" : "Dark"}</span>
    </button>
  );
}
