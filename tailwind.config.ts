import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondo casi negro, escala de grises fríos
        ink: {
          950: "#0a0a0b",
          900: "#0f0f11",
          850: "#141417",
          800: "#1a1a1e",
          750: "#212127",
          700: "#2a2a31",
          600: "#3a3a44",
        },
        // Acento rojo intenso (powerlifting)
        blood: {
          400: "#ff4d4d",
          500: "#ff1f1f",
          600: "#e60000",
          700: "#b80000",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-oswald)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(255,31,31,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
