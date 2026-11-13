import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bebas: ["var(--font-bebas)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        merah: {
          DEFAULT: "#C8102E",
          tua: "#9B0D24",
          muda: "#FDECEF",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

