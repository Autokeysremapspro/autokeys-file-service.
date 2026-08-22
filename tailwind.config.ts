import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: '#0A0D12',
        // AK Cloud brand red — replaces Tailwind's default pink-leaning red scale so every
        // red-300/400/500/etc. utility across the authenticated portal (buttons, active nav,
        // badges, borders) renders the true brand red from the new mockups, not the stock hue.
        red: {
          50: '#fff2f2',
          100: '#ffe1e2',
          200: '#ffc5c6',
          300: '#ff8f92',
          400: '#ff1924',
          500: '#ef1018',
          600: '#c20d13',
          700: '#97090e',
          800: '#6e070a',
          900: '#4a0507',
          950: '#2b0304',
        },
        copper: {
          DEFAULT: '#E2954D',
          bright: '#FFB870',
          deep: '#B8672B',
        },
        signal: {
          DEFAULT: '#5EEAD4',
          bright: '#99F6E4',
        },
        chalk: '#F5F1E8',
      },
    },
  },
  plugins: [],
}
export default config
