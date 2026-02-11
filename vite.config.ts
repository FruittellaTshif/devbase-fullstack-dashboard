/**
 * vite.config.ts
 * -------------------------------------------------------
 * Forcer PostCSS (Tailwind + Autoprefixer) via Vite.
 * => garantit que Tailwind compile même si postcss.config est ignoré.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
});
