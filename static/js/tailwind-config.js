(() => {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          /* 60:30:10 palette */
          surface: {
            DEFAULT: "#0a0e1a",
            dim: "#070a14",
            card: "rgba(255,255,255,0.04)",
            elevated: "rgba(255,255,255,0.06)",
            bright: "#1a1f30",
          },
          "on-surface": {
            DEFAULT: "#eef0ff",
            variant: "#a0a8c4",
            muted: "#636b88",
          },
          primary: {
            DEFAULT: "#c4b5fd",
            container: "#7c3aed",
            dark: "#6d28d9",
          },
          secondary: {
            DEFAULT: "#89ceff",
            container: "#0ea5e9",
          },
          accent: {
            DEFAULT: "#a855f7",
            surface: "rgba(124,58,237,0.12)",
            glow: "rgba(124,58,237,0.25)",
          },
          success: {
            DEFAULT: "#10b981",
            surface: "rgba(16,185,129,0.12)",
          },
          error: {
            DEFAULT: "#ef4444",
            surface: "rgba(239,68,68,0.12)",
          },
          warning: {
            DEFAULT: "#f59e0b",
            surface: "rgba(245,158,11,0.12)",
          },
          border: {
            subtle: "rgba(255,255,255,0.08)",
            hover: "rgba(124,58,237,0.5)",
          },
          background: "#0a0e1a",
          "on-background": "#eef0ff",
          "inverse-surface": "#eef0ff",
          "inverse-on-surface": "#1a1f30",
          "inverse-primary": "#7c3aed",
        },
        borderRadius: {
          sm: "6px",
          DEFAULT: "8px",
          md: "8px",
          lg: "12px",
          xl: "16px",
          "2xl": "24px",
          full: "9999px",
        },
        /* Strict 8-pixel grid */
        spacing: {
          0.5: "4px",
          1: "8px",
          1.5: "12px",
          2: "16px",
          3: "24px",
          4: "32px",
          5: "40px",
          6: "48px",
          7: "56px",
          8: "64px",
          10: "80px",
          12: "96px",
          16: "128px",
        },
        fontFamily: {
          "headline-md": ["Space Grotesk", "system-ui", "sans-serif"],
          "display-lg": ["Space Grotesk", "system-ui", "sans-serif"],
          "body-md": ["Inter", "system-ui", "sans-serif"],
          "label-sm": ["Inter", "system-ui", "sans-serif"],
          "body-lg": ["Inter", "system-ui", "sans-serif"],
        },
        /* Modular type scale — 1.25 ratio */
        fontSize: {
          "caption":    ["12px", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "500" }],
          "label-sm":   ["12px", { lineHeight: "1",   letterSpacing: "0.06em", fontWeight: "600" }],
          "body-sm":    ["14px", { lineHeight: "1.5", letterSpacing: "0",      fontWeight: "400" }],
          "body-md":    ["16px", { lineHeight: "1.6", letterSpacing: "0",      fontWeight: "400" }],
          "body-lg":    ["18px", { lineHeight: "1.6", letterSpacing: "0",      fontWeight: "400" }],
          "sub-heading":["20px", { lineHeight: "1.4", letterSpacing: "-0.01em",fontWeight: "500" }],
          "heading":    ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em",fontWeight: "600" }],
          "headline-md":["32px", { lineHeight: "1.2", letterSpacing: "-0.02em",fontWeight: "700" }],
          "display-lg": ["48px", { lineHeight: "1.05",letterSpacing: "-0.03em",fontWeight: "800" }],
          "display-xl": ["56px", { lineHeight: "1.0", letterSpacing: "-0.03em",fontWeight: "800" }],
        },
        boxShadow: {
          "card":       "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
          "card-hover": "0 2px 8px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.3)",
          "elevated":   "0 4px 16px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.3)",
          "glow":       "0 0 32px rgba(124,58,237,0.25)",
          "btn":        "0 2px 8px rgba(124,58,237,0.3)",
          "btn-hover":  "0 4px 20px rgba(124,58,237,0.45)",
          "buy":        "0 2px 8px rgba(16,185,129,0.3)",
          "buy-hover":  "0 4px 20px rgba(16,185,129,0.45)",
        },
        animation: {
          "fade-in":      "fadeIn 0.4s ease forwards",
          "fade-in-up":   "fadeInUp 0.5s ease forwards",
          "scale-in":     "scaleIn 0.3s ease forwards",
          "slide-up":     "slideUp 0.4s ease forwards",
          "glow-pulse":   "glow-pulse 3s infinite",
          "float":        "float 4s ease-in-out infinite",
        },
        keyframes: {
          fadeIn:    { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" }},
          fadeInUp:  { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" }},
          scaleIn:   { from: { opacity: "0", transform: "scale(0.92)" },     to: { opacity: "1", transform: "scale(1)" }},
          slideUp:   { from: { transform: "translateY(100%)" },              to: { transform: "translateY(0)" }},
          "glow-pulse": { "0%, 100%": { boxShadow: "0 0 16px rgba(124,58,237,0.15)" }, "50%": { boxShadow: "0 0 32px rgba(124,58,237,0.3)" }},
          float:     { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" }},
        },
      },
    },
  };
})();
