import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Plus Jakarta Sans",
          "system-ui",
          "sans-serif",
        ],
        pixel: ["var(--font-pixel)", "monospace"],
      },
      colors: {
        merah: {
          DEFAULT: "#C8102E",
          tua: "#9B0D24",
          muda: "#FDECEF",
        },
        apple: {
          blue: "#0071E3",
          hover: "#0077ED",
          darkblue: "#2997FF",
        },
      },
      borderRadius: {
        pill: "980px",
        glass: "20px",
      },
    },
  },
  plugins: [],
} satisfies Config;


