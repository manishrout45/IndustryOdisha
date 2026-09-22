/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0c2340",
          soft: "#1a3554",
          muted: "#4a5d73",
        },
        accent: {
          DEFAULT: "#c62828",
          soft: "#e53935",
          softbg: "#fdecea",
        },
        paper: {
          DEFAULT: "#f4f6f8",
          card: "#ffffff",
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Source Sans 3"', "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        site: "1280px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(12, 35, 64, 0.06)",
      },
    },
  },
  plugins: [],
};
