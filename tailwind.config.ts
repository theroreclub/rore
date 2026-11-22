import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        "background": "var(--rc-background)",
        "surface": "var(--rc-surface)",
        "product-stage": "var(--rc-product-stage)",
        "border": "var(--rc-border)",
        "text": "var(--rc-text)",
        "muted-text": "var(--rc-muted-text)",
        "accent": "var(--rc-accent)",
        "accent-deep": "var(--rc-accent-deep)",
        // Aliases used by existing storefront utilities.
        canvas: "var(--rc-background)",
        ivory: "var(--rc-text)",
        muted: "var(--rc-muted-text)",
        champagne: "var(--rc-accent)",
        hairline: "var(--rc-border)",
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
