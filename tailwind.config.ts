// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)", // our orange
        brandFg: "var(--brand-fg)", // readable foreground on brand bg
        accent: {
          DEFAULT: "#FF6A00", // DealTown orange
          fg: "#ffffff",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#F7F8FA",
        },
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-brand)", "ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Arial"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        xl2: "1rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
