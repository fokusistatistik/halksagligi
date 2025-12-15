import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#E30613",
          foreground: "#ffffff",
          hover: "#c40510",
        },
        secondary: {
          DEFAULT: "#003366",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#6B7280",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
