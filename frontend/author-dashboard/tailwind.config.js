/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0c2340",
          soft: "#152a45",
          muted: "#5b6b7c",
        },
        accent: {
          DEFAULT: "#c62828",
          soft: "#e53935",
        },
        surface: {
          DEFAULT: "#f3f5f8",
          card: "#ffffff",
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "Segoe UI", "sans-serif"],
        display: ['"Source Serif 4"', "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(12,35,64,0.04), 0 8px 24px rgba(12,35,64,0.06)",
      },
    },
  },
  plugins: [],
};
