/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f9',
          100: '#d0dbed',
          200: '#a1b7db',
          300: '#7293c8',
          400: '#436fb6',
          500: '#2a5299',
          600: '#1e3a5f',
          700: '#172d4a',
          800: '#102035',
          900: '#081220',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(8px)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'fade-in':    'fadeIn 0.6s ease-out forwards',
        'bounce-y':   'bounceY 1.4s ease-in-out infinite',
      },
      boxShadow: {
        'amber-glow': '0 4px 24px rgba(245, 158, 11, 0.4)',
        'navy-card':  '0 4px 24px rgba(30, 58, 95, 0.10)',
      },
    },
  },
  plugins: [],
}
