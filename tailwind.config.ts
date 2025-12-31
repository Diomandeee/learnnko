import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // shadcn/ui semantic colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Comp-Core Design System - Deep space theme
        space: {
          950: "#050508",
          900: "#0a0a0f",
          800: "#0f0f18",
          700: "#151520",
          600: "#1a1a28",
          500: "#252535",
          400: "#303045",
        },
        // Electric cyan - primary accent (N'Ko script glow)
        cyber: {
          50: "#e0fcff",
          100: "#bef8fd",
          200: "#87eaf2",
          300: "#54d1db",
          400: "#38bec9",
          500: "#00f0ff",
          600: "#0bc5ea",
          700: "#0987a0",
          800: "#086f83",
          900: "#065666",
        },
        // Warm amber - energy/intensity (learning progress)
        amber: {
          400: "#fbbf24",
          500: "#ffaa00",
          600: "#f59e0b",
        },
        // Soft violet - phase/rhythm (N'Ko cultural heritage)
        phase: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        // N'Ko gold - traditional script color
        nko: {
          gold: "#D4AF37",
          bronze: "#CD7F32",
          copper: "#B87333",
        },
        // Status colors
        converged: "#10b981",
        seeking: "#f59e0b",
        error: "#ef4444",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        nko: ["Noto Sans NKo", "sans-serif"],
      },
      keyframes: {
        "collapse-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapse-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            filter: "brightness(1)",
          },
          "50%": {
            opacity: "0.8",
            filter: "brightness(1.2)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "25%": { transform: "translateY(-10px) rotate(2deg)" },
          "50%": { transform: "translateY(-5px) rotate(-1deg)" },
          "75%": { transform: "translateY(-15px) rotate(1deg)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "collapse-down": "collapse-down 0.2s ease-out",
        "collapse-up": "collapse-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        orbit: "orbit 10s linear infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      boxShadow: {
        cyber: "0 0 20px rgba(0, 240, 255, 0.3)",
        "cyber-lg": "0 0 40px rgba(0, 240, 255, 0.4)",
        amber: "0 0 20px rgba(255, 170, 0, 0.3)",
        phase: "0 0 20px rgba(139, 92, 246, 0.3)",
        nko: "0 0 20px rgba(212, 175, 55, 0.3)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "nko-pattern": "linear-gradient(rgba(212, 175, 55, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.02) 1px, transparent 1px)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config
