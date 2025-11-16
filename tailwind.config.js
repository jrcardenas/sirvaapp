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
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        surfaceAlt: "var(--color-surface-alt)",

        textDark: "var(--color-text-dark)",
        textMuted: "var(--color-text-muted)",
        disabledText: "var(--color-text-disabled)",

        border: "var(--color-border)",

        primary: "var(--color-primary)",
        primaryLight: "var(--color-primary-light)",
        accent: "var(--color-accent)",
        danger: "var(--color-danger)",

        disabledBg: "var(--color-disabled-bg)",
      },

      borderRadius: {
        DEFAULT: "var(--radius)",
      },

      height: {
        button: "var(--button-height)",
      },
    },
  },
  plugins: [],
};
