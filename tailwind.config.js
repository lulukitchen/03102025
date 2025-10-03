/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'chinese-red': '#DC143C',
        'chinese-darkRed': '#8B0000',
        'chinese-black': '#1A1A1A',
        'chinese-gold': '#FFD700',
        'chinese-lightGold': '#FFF8DC',
      },
      fontFamily: {
        sans: ['Noto Sans Hebrew', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.75rem', { lineHeight: '1', fontWeight: '700' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};
