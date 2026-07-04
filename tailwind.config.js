/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0a0a0b",
        charcoal: "#151517",
        graphite: "#1e1e21",
        gold: {
          DEFAULT: "#c9a227",
          light: "#e0bf5a",
          dark: "#9c7d1c",
        },
        bone: "#f2f0ea",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #e0bf5a 0%, #c9a227 45%, #8a6a16 100%)",
      },
    },
  },
  plugins: [],
}
