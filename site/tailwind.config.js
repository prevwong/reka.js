const { fontFamily } = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/markdown.ts',
  ],

  theme: {
    extend: {
      screens: {
        sm: '660px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        code: ['var(--font-jetbrainsmono)'],
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
      width: {
        'editor-left-sidebar': 250,
        'editor-right-sidebar-ui': 300,
        'editor-right-sidebar-code': 500,
      },
      height: {
        header: 50,
      },
      colors: {
        outline: '#e8e7e7',
        canvas: '#efefef',
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
        secondary: {
          DEFAULT: '#9334e9',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c085fb',
          500: '#a856f6',
          600: '#9334e9',
          700: '#7e23cd',
          800: '#6b22a7',
          900: '#581d86',
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
            '--tw-prose-links': theme('colors.primary[700]'),
            a: {
              fontWeight: 'inherit',
            },
            'h1 a, h2 a, h3 a, h4 a': {
              color: 'inherit',
            },
            pre: {
              backgroundColor: 'var(--tw-prose-pre-bg)',
              overflowX: 'auto',
              fontWeight: '400',
            },
            code: {
              backgroundColor: theme('colors.secondary[100]'),
              color: theme('colors.secondary'),
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
            'blockquote code': {
              color: theme('colors.secondary'),
            },
            'blockquote p:first-of-type::before': {
              content: '',
            },
            'blockquote p:last-of-type::after': {
              content: '',
            },
            'p > a ': {
              color: theme('colors.primary'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        html: { fontFamily: theme('fontFamily.sans') },
      });
    }),
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
