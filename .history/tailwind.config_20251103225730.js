/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        primaryLight: "#4CAF50",
        accent: "#81C784",

        background: "#FAFAF7",
        surface: "#FFFFFF",
        surfaceAlt: "#F3F3EF",

        border: "#D4D4D4",

        textDark: "#1B1B1B",
        textMuted: "#606060",
        textDisabled: "#AFAFAF",

        minusButton: "#E0E0E0",
        minusIcon: "#555",

        disabledBg: "#E6E6E6",
        disabledText: "#A8A8A8",

        danger: "#c62828", // ✅ Nuevo color rojo para botón “-”
      },
      borderRadius: {
        DEFAULT: "14px",
      },
      height: {
        button: "48px",
      },
    },
  },
  plugins: [],
};
