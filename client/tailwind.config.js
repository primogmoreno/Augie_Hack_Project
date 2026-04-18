/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E4D8C',
          accent:  '#2E86AB',
        },
      },
    },
  },
  plugins: [],
};
