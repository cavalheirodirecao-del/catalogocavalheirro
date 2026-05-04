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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        "dm-sans": ["var(--font-dm-sans)", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        bebas: ["var(--font-bebas)", "Impact", "sans-serif"],
        "space-mono": ["var(--font-space-mono)", "Courier New", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
