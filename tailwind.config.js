/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emirates: {
          red: '#D71920',
          'red-dark': '#B91518',
          gold: '#B9975B',
          'gold-dark': '#A8865A',
          sand: '#EADBC8',
          black: '#1C1C1C',
        },
      },
    },
  },
  plugins: [],
};
