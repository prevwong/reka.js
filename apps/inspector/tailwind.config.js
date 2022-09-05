module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('radix-colors-for-tailwind')({
      colors: ['blue', 'cyan', 'lime'],
    }),
  ],
};
