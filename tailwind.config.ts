import type { Config } from "tailwindcss";

/**
 * HML Prism design tokens.
 * - navy:   primary brand color (#0D2F4A)
 * - accent: bright cyan/teal used for CTAs, links and highlights (#2EC4B6)
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0D2F4A",
          50: "#eef4f9",
          100: "#d3e2ee",
          200: "#a6c4dd",
          300: "#6f9dc4",
          400: "#3d6f9e",
          500: "#1e4f7d",
          600: "#143d63",
          700: "#0D2F4A",
          800: "#0a2438",
          900: "#061826",
        },
        accent: {
          DEFAULT: "#2EC4B6",
          50: "#e7faf7",
          100: "#c4f2ec",
          200: "#8fe6da",
          300: "#57d6c6",
          400: "#2EC4B6",
          500: "#1fa89b",
          600: "#18867c",
          700: "#156b64",
          800: "#135550",
          900: "#124743",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1.25rem",
          lg: "2rem",
        },
        screens: {
          "2xl": "1200px",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
