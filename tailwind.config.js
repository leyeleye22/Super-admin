/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base:    "#F7F3F6",
        sidebar: "#FBF7FA",
        surface: "#FFFFFF",
        subtle:  "#F1EAF0",
        overlay: "#FFFCFE",
        border:        "#E4E2E8",
        "border-strong":"#C9C6D0",
        ink:     "#1A1523",
        body:    "#3D2F3B",
        muted:   "#7C6B7A",

        rose:        "#B10E6B",
        "rose-deep": "#8B0A54",
        "rose-light":"#EC4899",
        "rose-100":  "#FCE7F3",
        "rose-50":   "#FDF2F8",
        "rose-200":  "#FBCFE8",
        "rose-300":  "#F9A8D4",

        success:     "#16A34A",
        "success-bg":"#F0FDF4",
        warning:     "#D97706",
        "warning-bg":"#FFFBEB",
        danger:      "#DC2626",
        "danger-bg": "#FEF2F2",
        info:        "#0284C7",
        "info-bg":   "#F0F9FF",
      },

      fontFamily: {
        sans: ['"Inter"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "system-ui", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      boxShadow: {
        "soft": "0 14px 32px rgba(26,21,35,0.08)",
        "card":     "0 18px 45px rgba(26,21,35,0.06), 0 2px 10px rgba(26,21,35,0.04)",
        "card-hover": "0 24px 60px rgba(26,21,35,0.09), 0 6px 18px rgba(26,21,35,0.05)",
        "card-rose": "0 16px 34px rgba(177,14,107,0.20)",
      },

      animation: {
        "fade-in":  "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-dot":"pulseDot 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn:   { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:  { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseDot:{ "0%,100%": { opacity: "1" }, "50%": { opacity: "0.3" } },
      },
    },
  },
  plugins: [],
};
