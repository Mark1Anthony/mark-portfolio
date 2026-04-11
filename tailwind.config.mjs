/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f5fa',
          100: '#e7e7f2',
          200: '#c9c9db',
          300: '#9d9dbd',
          400: '#6e6e96',
          500: '#4e4e73',
          600: '#3a3a57',
          700: '#2b2b42',
          800: '#1d1d30',
          900: '#13131f',
          950: '#0a0a14',
        },
        accent: {
          cyan: '#5eead4',
          teal: '#22d3ee',
          violet: '#a78bfa',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
};
