/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /./, // the "." means "everything"
      variants: ['hover'],
    },
  ],
  plugins: [],
};
