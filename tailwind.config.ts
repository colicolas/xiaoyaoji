import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        beiming: "#1B3C59",
        "sky-cyan": "#AEC4E5",
        "cloud-white": "#F7F9F9",
        "fish-belly": "#FFE4E1",
        jade: "#98C1D9",
      },
      fontFamily: {
        sans: ["var(--font-quicksand)", "sans-serif"],
        zcool: ["var(--font-zcool)", "cursive"],
      },
    },
  },
};

export default config;
