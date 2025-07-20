/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        secondary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Added neutral tones for more professional look
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from var(--angle), var(--tw-gradient-stops))",
        "gradient-subtle":
          "linear-gradient(to right bottom, var(--tw-gradient-stops))",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
      },
      boxShadow: {
        "inner-light": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        elevated:
          "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss/plugin")(({ addUtilities }) => {
      addUtilities({
        ".bg-gradient-to-r": {
          backgroundImage:
            "linear-gradient(to right, var(--tw-gradient-stops))",
        },
        ".bg-gradient-to-b": {
          backgroundImage:
            "linear-gradient(to bottom, var(--tw-gradient-stops))",
        },
        ".from-primary-600": {
          "--tw-gradient-from": "#0284c7",
          "--tw-gradient-to": "rgb(2 132 199 / 0)",
          "--tw-gradient-stops":
            "var(--tw-gradient-from), var(--tw-gradient-to)",
        },
        ".from-primary-700": {
          "--tw-gradient-from": "#0369a1",
          "--tw-gradient-to": "rgb(3 105 161 / 0)",
          "--tw-gradient-stops":
            "var(--tw-gradient-from), var(--tw-gradient-to)",
        },
        ".to-primary-500": {
          "--tw-gradient-to": "#0ea5e9",
        },
        ".to-primary-600": {
          "--tw-gradient-to": "#0284c7",
        },
      });
    }),
    function ({ addBase, addUtilities, theme }) {
      addBase({
        ":root": {
          "--angle": "45deg",
        },
      });
      // Custom utility classes
      addUtilities({
        ".text-shadow-sm": {
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        },
        ".text-shadow": {
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        },
        ".text-shadow-lg": {
          textShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        },
        ".bg-blur": {
          backdropFilter: "blur(8px)",
        },
        ".bg-glass": {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px) saturate(180%)",
          border: "1px solid rgba(209, 213, 219, 0.3)",
        },
        ".bg-glass-dark": {
          backgroundColor: "rgba(17, 24, 39, 0.75)",
          backdropFilter: "blur(12px) saturate(180%)",
          border: "1px solid rgba(55, 65, 81, 0.3)",
        },
        ".bg-light-gradient": {
          background: "linear-gradient(to right bottom, #ffffff, #f8fafc, #f1f5fb, #ebf1fa, #e5ecfa)",
        },
        ".bg-dark-gradient": {
          background: "linear-gradient(to right bottom, #0f172a, #111827, #131525, #151323, #161320)",
        },
      });
    },
  ],
};
