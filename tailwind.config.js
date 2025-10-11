/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f97316", // orange-500
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(16,24,40,0.06)",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
