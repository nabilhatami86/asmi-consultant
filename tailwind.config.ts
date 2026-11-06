import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        sand: { 50: "#faf8f5", 100: "#f3efe8", 200: "#e7e0d4", 300: "#d5cab8" },
        gold: { 500: "#b8893a", 600: "#9a7030", 700: "#7a5826" },
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [typography],
};
export default config;
