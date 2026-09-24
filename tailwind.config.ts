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
        warmblue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aff7',
          500: '#0c94e8',
          600: '#0075c7',
          700: '#015da3',
          800: '#064e86',
          900: '#0b416f',
          950: '#07294a',
        },
        warmnavy: {
          800: '#111c30',
          900: '#0b1324',
          950: '#060a14',
        }
      },
    },
  },
  plugins: [],
};
export default config;
