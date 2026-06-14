/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        primary: {
          50: "#E8EEF7",
          100: "#C5D3E8",
          200: "#9FB4D6",
          300: "#7895C4",
          400: "#5C7FB8",
          500: "#3F69AC",
          600: "#2F5490",
          700: "#1E3F74",
          800: "#0F3460",
          900: "#0A2545",
        },
        accent: {
          50: "#FDECEF",
          100: "#FAD0D9",
          200: "#F6B0BE",
          300: "#F190A3",
          400: "#ED768E",
          500: "#E94560",
          600: "#C7304A",
          700: "#A51F38",
          800: "#831128",
          900: "#610A1C",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      fontFamily: {
        sans: ["Noto Sans SC", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(15, 52, 96, 0.08)",
        "card-hover": "0 8px 32px rgba(15, 52, 96, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
