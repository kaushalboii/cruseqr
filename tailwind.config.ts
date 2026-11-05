import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#09090F",
          secondary: "#11111B",
          card: "#171724",
          elevated: "#1E1E30",
        },
        border: {
          DEFAULT: "#272738",
          subtle: "#1F1F30",
          bright: "#3B3B54",
        },
        primary: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          light: "#A78BFA",
          dark: "#6D28D9",
          muted: "rgba(139, 92, 246, 0.15)",
        },
        accent: {
          DEFAULT: "#A78BFA",
          cyan: "#06B6D4",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.4)",
        "glow-lg": "0 0 50px -10px rgba(139, 92, 246, 0.35)",
        card: "0 8px 30px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
