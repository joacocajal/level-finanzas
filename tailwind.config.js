/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#e63946',
        'dark-bg': '#0a0a0a',
        'dark-card': '#141414',
        'dark-surface': '#1c1c1c',
        'dark-border': '#262626',
        'dark-muted': '#404040',
        'dark-text': '#a3a3a3',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        barlow: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
