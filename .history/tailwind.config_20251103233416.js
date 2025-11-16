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
        // Fondo general
        background: "#FAFAF7",
        surface: "#FFFFFF",
        surfaceAlt: "#F3F3EF",

        // Texto
        textDark: "#1B1B1B",
        textMuted: "#606060",
        textDisabled: "#AFAFAF",

        // Bordes
        border: "#D4D4D4",

        // Acciones
        primary: "#2E7D32",
        primaryLight: "#4CAF50",
        accent: "#81C784",
        danger: "#c62828",

        // Estados UI
        minusButton: "#E0E0E0",
        minusIcon: "#555",
        disabledBg: "#E6E6E6",
        disabledText: "#A8A8A8",
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
