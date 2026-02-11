/**
 * tailwind.config.cjs
 * -----------------------------------------
 * Tailwind v3 + daisyUI (stable)
 */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark", "night"],
  },
};
