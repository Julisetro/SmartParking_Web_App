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
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #008080, #e0f7fa)',
      },
    },
  },
  plugins: [],
};
