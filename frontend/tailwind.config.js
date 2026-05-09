/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        primary: "#1d4cd7",
        "sovereign-blue": "#1d4cd7",

        "background-light": "#f6f6f8",
        "background-dark": "#111521",

        "ink-gray": "#0e111b",
      },

      fontFamily: {
        display: ["Public Sans", "sans-serif"],
      },

      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },

  plugins: [],
};
