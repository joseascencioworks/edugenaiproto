/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        siceuc: {
          navy: '#1c335d',
          darkNavy: '#112338',
          deepBlue: '#232368',
          teal: '#103847',
          mint: '#5eead4',
          cyan: '#73dae0',
          accent: '#4ec7cc',
          lavender: '#eceafc',
          lavenderText: '#2b3085',
          bg: '#eef1f6',
          cardBorder: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
}
