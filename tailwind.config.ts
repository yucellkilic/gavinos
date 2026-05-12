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
        // ezCater-inspired palette
        ezGreen: {
          DEFAULT: '#00854d',
          dark: '#006b3e',
          light: '#e6f5ee',
          hover: '#007544',
          50: '#f0fdf6',
          100: '#dcfce9',
          500: '#00854d',
          600: '#006b3e',
          700: '#005a34',
        },
        ezOrange: {
          DEFAULT: '#ff6900',
          light: '#fff3e6',
        },
        // Legacy compatibility
        forestGreen: "#00854d",
        classicRed: "#e53935",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'ez': '8px',
        'ez-lg': '12px',
        'ez-xl': '16px',
      },
      boxShadow: {
        'ez-sm': '0 1px 2px rgba(0,0,0,0.05)',
        'ez': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'ez-md': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'ez-lg': '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
