/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8EE',
        ink: '#4A4446',
        muted: '#6B6366',
        maroon: {
          DEFAULT: '#5B4447',
          deep: '#4B373A',
          soft: '#6C5255',
        },
        burgundy: '#613536',
        gold: {
          DEFAULT: '#E8C5A0',
          light: '#F8DBBC',
          dark: '#D3A577',
          text: '#DDB183',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        arabic: ['Amiri', 'serif'],
      },
      boxShadow: {
        photo: '0 18px 40px -18px rgba(76, 55, 50, 0.45), 0 2px 8px rgba(76, 55, 50, 0.08)',
        card: '0 24px 50px -24px rgba(58, 40, 42, 0.55)',
        pill: '0 10px 22px -12px rgba(58, 40, 42, 0.55)',
        sheet: '0 -20px 60px -20px rgba(40, 28, 30, 0.45)',
      },
      letterSpacing: {
        wide2: '0.14em',
      },
    },
  },
  plugins: [],
}
