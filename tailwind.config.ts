// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)", // our orange
        brandFg: "var(--brand-fg)", // readable foreground on brand bg
      },
      fontFamily: {
        sans: ["var(--font-brand)", "ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Arial"],
      },
      boxShadow: {
        card: "0 6px 24px -10px rgb(0 0 0 / 0.15)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
