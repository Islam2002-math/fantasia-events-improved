import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7c3aed',
          dark: '#5b21b6',
          light: '#c4b5fd'
        }
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(124,58,237,0.25)'
      }
    },
  },
  plugins: [],
} satisfies Config
