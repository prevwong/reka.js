/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/markdown.ts',
  ],

  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
