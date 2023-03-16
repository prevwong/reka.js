/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/markdown.ts',
  ],

  theme: {
    extend: {
      fontFamily: {
        code: ['JetBrains Mono'],
      },
      keyframes: {
        show: {
          '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
        modalShow: {
          '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
          '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        show: 'show 150ms cubic-bezier(0.16, 1, 0.3, 1)`',
        modalShow: 'modalShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        fade: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionTimingFunction: {
        bezier: 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      colors: {
        secondary: '#9334e9',
        outline: '#e8e7e7',
        primary: {
          DEFAULT: '#0066DE',
          50: '#E8F3FF',
          100: '#D4E8FF',
          200: '#ABD2FF',
          300: '#82BCFF',
          400: '#59A5FF',
          500: '#318FFF',
          600: '#0879FF',
          700: '#0066DE',
          800: '#004CA6',
          900: '#00326E',
        },
      },

      zIndex: {
        max: '9999',
      },

      gridTemplateColumns: {
        'pair-input': '80px 1fr',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-quotes': theme('colors.gray[800]'),
            pre: {
              color: 'var(--tw-prose-pre-code)',
              backgroundColor: 'var(--tw-prose-pre-bg)',
              overflowX: 'auto',
              fontWeight: '400',
            },
            blockquote: {
              fontWeight: '400',
              fontStyle: 'normal',
              fontSize: theme('fontSize.sm'),
              border: '1px solid',
              borderColor: theme('colors.outline'),
              borderRadius: theme('borderRadius.md'),
              quotes: 'none',
              color: theme('colors.gray[900]'),
              boxShadow: theme('boxShadow.sm'),
            },
            'blockquote p:first-of-type::before': {
              content: '',
            },
            'blockquote p:last-of-type::after': {
              content: '',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
