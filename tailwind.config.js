/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rich Golden Lantern palette inspired by Hoi An twilight sunset
        brand: {
          50: '#fffbeb',  // Warm amber light tint
          100: '#fef3c7',
          400: '#fbbf24', // Bright yellow-gold
          500: '#f59e0b', // Primary Amber Gold (glowing lantern)
          600: '#d97706',
          700: '#b45309',
          900: '#78350f',
        },
        heritage: {
          50: '#fff5f5',  // Sunset orange tint
          500: '#f97316', // Sunset Orange
          600: '#ea580c', // Deep glowing orange-red
          700: '#c2410c',
          900: '#7c2d12',
        },
        neutral: {
          50: '#f8fafc',   // Brightest text (Slate 50)
          100: '#f1f5f9',  // Primary body text (Slate 100)
          200: '#e2e8f0',  // Secondary text (Slate 200)
          300: '#cbd5e1',  // Medium grey-blue text (Slate 300)
          400: '#94a3b8',  // Soft slate-grey text (Slate 400)
          500: '#64748b',  // Muted text (Slate 500)
          600: '#475569',  // Darker slate (Slate 600)
          700: '#334155',  // Dark border (Slate 700)
          800: '#1e293b',  // Dark background elements (Slate 800)
          900: '#0f172a',  // Slate 900
          955: '#090d16',  // Deep dark slate background
        },
        danger: {
          50: '#fef2f2',
          600: '#dc2626',  // High contrast red for traps
          700: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
