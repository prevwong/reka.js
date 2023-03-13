/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/markdown.ts',
  ],

  theme: {
    extend: {
      colors: {
        primary: '#0066de',
        secondary: '#9334e9',
      },
      spacing: {
        1: '1px',
        2: '4px',
        3: '8px',
        4: '16px',
        5: '24px',
        6: '32px',
        7: '40px',
        8: '48px',
        9: '56px',
      },
      zIndex: {
        max: '9999',
      },
      fontSize: {
        xss: '0.55rem',
        xs: '11px',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.125rem',
        xl: '2.25rem',
        '2xl': '1.5rem',
        '3xl': '1.25rem',
      },
      gridTemplateColumns: {
        'pair-input': '80px 1fr',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
