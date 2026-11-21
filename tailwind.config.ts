import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        canvas: "var(--rc-canvas)", surface: "var(--rc-surface)",
        ivory: "var(--rc-text)", muted: "var(--rc-muted)",
        champagne: "var(--rc-accent)", hairline: "var(--rc-line)",
      },
      fontFamily: {
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
        sans: ["var(--font-ui)", "Arial", "sans-serif"],
      },
      spacing: {
        gutter: "clamp(1.25rem, 5vw, 5rem)",
        section: "clamp(4rem, 9vw, 9rem)",
      },
      maxWidth: { atelier: "84rem" },
      fontSize: {
        headline: ["clamp(3rem, 7vw, 7rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
      },
    },
  },
} satisfies Config;
