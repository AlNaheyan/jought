/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        ui:      ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        reading: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        mono:    ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        sans:    ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: {
          50:  '#FAFAF7',
          100: '#F5F4F0',
          200: '#EDECEA',
          300: '#E2E0DC',
          400: '#C9C7C2',
          500: '#AEADA9',
          600: '#706F6B',
          700: '#4A4946',
          800: '#2A2926',
          900: '#1C1B18',
        },
        gold: {
          50:  '#FEF9EE',
          100: '#FCEFD1',
          200: '#F8DDA0',
          300: '#F4C665',
          400: '#EDAB3E',
          500: '#C8841C',
          DEFAULT: '#C08030',
          600: '#B07018',
          700: '#8B5915',
          800: '#6B4518',
          900: '#573818',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out forwards',
        'fade-up':  'fadeUp 0.7s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
