import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hikari: {
          primary: "#2C742F",
          background: "#D7E5D8",
          accent: "#AAE970",
          text: "#1C1B1F",
          secondary: "#79747E",
          surface: "#F2F7ED",
          mint: "#CBEAD2",
          coral: "#EA4B48",
          forest: "#366306",
        },
        brand: {
          sage: {
            bg: "#D7E5D8",
            forest: "#366306",
            forestLight: "#366306E5",
            grey: "#79747E",
            lime: "#AAE970",
            charcoal: "#1C1B1F",
            green: "#2C742F",
            mint: "#CBEAD2",
            coral: "#EA4B48",
            coralLight: "#FF8682",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Poppins", "system-ui", "sans-serif"],
      },
      screens: {
        'xs': '320px',
      },
    },
  },
  plugins: [],
};

export default config;
