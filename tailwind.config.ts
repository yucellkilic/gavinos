import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forestGreen: "#2d8659",
        classicRed: "#e53935",
        neonRed: "#FF0040",
        neonGreen: "#00FF41",
        gold: "#FFD700",
        deepBlack: "#0a0a0a",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      transitionDuration: {
        '200': '200ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
