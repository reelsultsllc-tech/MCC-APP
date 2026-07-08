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
      },
      fontFamily: {
        lora: ['Lora', 'Georgia', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
