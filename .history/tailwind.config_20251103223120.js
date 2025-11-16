/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./store/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",       // Verde principal
        primaryLight: "#4CAF50",  // Verde vivo
        accent: "#81C784",        // Verde suave
        surface: "#FFFFFF",
        surfaceAlt: "#F3F3EF",
        border: "#D4D4D4",
        textDark: "#1B1B1B",
        textMuted: "#606060",
        textDisabled: "#AFAFAF",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};
