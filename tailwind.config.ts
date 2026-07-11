import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7A1E2C',
        'primary-dark': '#5C1520',
        background: '#F7F5F4',
        'text-dark': '#241014',
        'text-muted': '#57504E',
        'text-light': '#9C9492',
        'green-elim': '#6F8F5C',
        'green-elim-dark': '#4F9A5C',
        'green-elim-bg': '#E7EFDE',
        'green-elim-darker': '#3E6B2E',
        'gold-verif': '#B8862E',
        'gold-verif-bg': '#F6EFDF',
        'gold-verif-dark': '#8A5F1E',
        border: '#E7E2E1',
        card: '#FFFFFF',
        wine: {
          200: '#f9d0d8',
          300: '#f9b0c0',
          400: '#e04a6e',
          500: '#ab1c42',
          600: '#8a1535',
          800: '#4a0820',
          900: '#38171f',
          950: '#2a1218',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        lora: ['Lora', 'Georgia', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
      keyframes: {
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        rotateCard: {
          '0%,100%': { transform: 'perspective(900px) rotateX(5deg) rotateY(-15deg)' },
          '50%':     { transform: 'perspective(900px) rotateX(-3deg) rotateY(10deg)' },
        },
      },
      animation: {
        'slide-in-up':   'slide-in-up 0.25s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        rotateCard:      'rotateCard 6s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
