/** @type {import('tailwindcss')} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#008080',
        'primary-dark': '#005757',
        'primary-light': '#e0f7fa',
        'text-main': '#333333',
        background: '#FFFFFF',
      },
      fontFamily: {
        sans: ['"Roboto"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
