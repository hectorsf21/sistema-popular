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
        brand: {
          50: '#f0f4ff',
          100: '#d9e2ff',
          200: '#b7c8ff',
          300: '#85a2ff',
          400: '#5272ff',
          500: '#2642ff',
          600: '#1125f5',
          700: '#0b16d5',
          800: '#0e15ab',
          900: '#121886',
          950: '#0a0d4e',
        },
        patria: {
          red: '#D91F26',
          darkRed: '#991116',
          yellow: '#FFD700',
          blue: '#00247D',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(to right bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92))',
      },
    },
  },
  plugins: [],
};
export default config;
