/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./index.html",
    "./components/**/*.{vue,js,ts,jsx,tsx}",
    "./pages/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.zinc,
        background: colors.white,
        accent: colors.blue,
        // accent: '#0e7490AA',
        borderColor: colors.zinc
        // primary: '#000000' 
      }
    },
  },
  plugins: [],
}
