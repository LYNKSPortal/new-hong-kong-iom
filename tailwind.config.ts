import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#B92F37",
          "red-dark": "#772428",
          "red-muted": "#956247",
          black: "#000000",
          charcoal: "#030404",
          white: "#FFFFFF",
          cream: "#FCFDFD",
          neutral: "#E7E2D2",
        },
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: { soft: "0 18px 60px rgba(3, 4, 4, 0.10)" },
    },
  },
  plugins: [],
};

export default config;
