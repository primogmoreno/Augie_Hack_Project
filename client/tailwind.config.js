/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal:  { 50: '#EAF5F3', 500: '#1F7A6B', 600: '#166055', 700: '#0F4A41' },
        amber: { 50: '#FBF1E0', 400: '#D2902A', 500: '#A8721F' },
        ink:   { 0: '#FBF8F3', 50: '#F3EEE5', 100: '#E7DFD1', 800: '#1C1813' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
