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
        // Acento de marca Olimpo Gym: verde intenso.
        // 200-400 → texto e iconos sobre fondo oscuro (alto contraste)
        // 500     → bordes, focus, tintes translúcidos
        // 600-800 → degradados de botón (llevan texto blanco encima)
        accent: {
          200: "#a5f3c5",
          300: "#5ce89a",
          400: "#1fd677",
          500: "#03bf62",
          600: "#009b4e",
          700: "#00773b",
          800: "#005a2c",
        },
        // Rojo semántico: solo estados de error, peligro y membresía suspendida.
        // No es color de marca; no usarlo para acciones primarias.
        danger: {
          200: "#ffc9c9",
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
        glow: "0 0 24px -6px rgba(3,191,98,0.5)",
        "glow-danger": "0 0 24px -6px rgba(255,31,31,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
