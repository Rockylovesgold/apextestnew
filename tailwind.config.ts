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
        background: "var(--color-bg-base)",
        foreground: "var(--color-text-primary)",
        "bg-primary": "var(--color-bg-base)",
        "bg-secondary": "var(--color-bg-surface)",
        "bg-tertiary": "var(--color-bg-elevated)",
        "bg-elevated": "var(--color-bg-elevated)",
        gold: {
          DEFAULT: "var(--color-accent-blue)",
          primary: "var(--color-accent-blue)",
          light: "#7AB3FF",
          dark: "var(--color-accent-blue-dim)",
        },
        blue: {
          DEFAULT: "var(--color-accent-blue)",
          primary: "var(--color-accent-blue)",
          light: "#7AB3FF",
          dark: "var(--color-accent-blue-dim)",
        },
        "green-profit": "var(--color-positive)",
        "red-loss": "var(--color-negative)",
        "blue-trust": "#1A2548",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-muted)",
      },
      fontFamily: {
        // Primary: Inter for everything
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Data / mono: JetBrains Mono
        data: ["var(--font-jetbrains)", "monospace"],
        mono: ["var(--font-jetbrains)", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-hero": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        h1: ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.15", letterSpacing: "-0.03em" }],
        h2: ["clamp(1.75rem, 4vw, 3.5rem)", { lineHeight: "1.15", letterSpacing: "-0.03em" }],
        h3: ["clamp(1.25rem, 2.5vw, 1.5rem)", { lineHeight: "1.3" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        body: ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        label: ["0.75rem", { lineHeight: "1.4" }],
        caption: ["0.6875rem", { lineHeight: "1.4" }],
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #1E50B3 0%, #7AB3FF 45%, #3680FF 70%, #1E50B3 100%)",
        "gold-gradient-subtle":
          "linear-gradient(135deg, #3680FF 0%, #B8D4FF 50%, #3680FF 100%)",
        "blue-gradient":
          "linear-gradient(135deg, #1E50B3 0%, #7AB3FF 45%, #3680FF 70%, #1E50B3 100%)",
      },
      boxShadow: {
        glass: "var(--shadow-card)",
        "glass-hover": "var(--shadow-card-hover)",
        cta: "var(--shadow-cta)",
        "gold-glow": "0 0 24px rgba(54, 128, 255, 0.22)",
        "gold-glow-sm": "0 0 12px rgba(54, 128, 255, 0.18)",
        "blue-glow": "0 0 24px rgba(54, 128, 255, 0.22)",
        "blue-glow-sm": "0 0 12px rgba(54, 128, 255, 0.18)",
        elevated: "var(--shadow-elevated)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        glass: "var(--radius-lg)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        section: "var(--space-16)",
        "section-sm": "var(--space-12)",
        "section-lg": "var(--space-24)",
      },
      maxWidth: {
        content: "65ch",
        "content-wide": "72ch",
        "content-wide-xl": "88rem",
        "site": "var(--max-width-content)",
        "narrow": "var(--max-width-narrow)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        shimmer: "shimmer 8s linear infinite",
        marquee: "marquee 30s linear infinite",
        "scroll-pulse": "scroll-pulse 1.8s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
