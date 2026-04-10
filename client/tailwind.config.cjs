/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C6BC4',
          light: '#A99DDB',
          dark: '#5E4FA2',
        },
        bg: {
          main: '#F0EEF7',
          card: '#FFFFFF',
        },
        sidebar: '#1A1A2E',
        text: {
          primary: '#2D2B55',
          secondary: '#6B6B8D',
          muted: '#9B9BB4',
        },
        border: '#E5E4F0',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#EF4444',
        info: '#60A5FA',
      },
      borderRadius: {
        card: '12px',
        panel: '16px',
        btn: '8px',
        hero: '24px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(124, 107, 196, 0.08)',
        card: '0 2px 16px rgba(124, 107, 196, 0.06)',
        elevated: '0 8px 40px rgba(124, 107, 196, 0.12)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 250ms ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
