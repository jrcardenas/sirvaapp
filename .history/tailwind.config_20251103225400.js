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

        textDark: "#1B1B1B",
        textMuted: "#606060",

        danger: "#E53935",    // 🔴 botón -
        disabled: "#C2C2C2"   // ⚪ estados apagados
      },

      borderRadius: {
        DEFAULT: "14px",
      },

      height: {
        button: "48px",
      }
    },
  },

  plugins: [],
};
