import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sm: {
          cyan: "#00D4E8",
          deep: "#0085A1",
          white: "#FFFFFF",
          cream: "#F8FAFC",
          coral: "#FF6B8A",
          dark: "#1E293B",
          gray: "#64748B",
          lightgray: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        script: ["Playfair Display", "serif"],
      },
      animation: {
        heartbeat: "heartbeat 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.08)" },
          "50%": { transform: "scale(1)" },
          "75%": { transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        sm: "0 4px 24px rgba(0, 212, 232, 0.08)",
        md: "0 8px 32px rgba(0, 212, 232, 0.12)",
        lg: "0 20px 40px rgba(0, 212, 232, 0.15)",
        coral: "0 8px 32px rgba(255, 107, 138, 0.15)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};
export default config;