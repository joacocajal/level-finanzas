/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#e63946',
        'dark-bg':      '#000000',
        'dark-card':    '#0d0d0d',
        'dark-surface': '#141414',
        'dark-border':  '#1a1a1a',
        'dark-muted':   '#2a2a2a',
        'dark-text':    '#707070',
      },
      fontFamily: {
        bebas:  ['Bebas Neue', 'sans-serif'],
        barlow: ['Inter', 'Barlow', 'sans-serif'],
        inter:  ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
