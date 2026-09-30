/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#EFECE3',
        stone: '#E3DEC9',
        ivory: '#F7F5EE',
        hairline: '#CEC7B4',
        navy: {
          deep: '#131B2E',
          surface: '#1B253B',
          muted: '#2A3652',
        },
        terracotta: {
          DEFAULT: '#C85A32',
          dark: '#A64622',
          light: '#F7E5DE',
        },
        forest: {
          DEFAULT: '#2C4A3E',
          dark: '#1E352C',
          light: '#DFECE6',
        },
        ochre: {
          DEFAULT: '#C59B38',
          dark: '#9D7922',
          light: '#F6EED8',
        },
        ink: {
          primary: '#131B2E',
          secondary: '#4A505C',
          mono: '#6E6A5F',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
