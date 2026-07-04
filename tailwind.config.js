/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-contrast, premium color scheme complying with WCAG 2.1 AA
        brand: {
          50: '#f0fdfa', // Teal light
          100: '#ccfbf1',
          500: '#0d9488', // Teal accent
          600: '#0f766e',
          700: '#115e59',
          900: '#134e4a',
        },
        heritage: {
          50: '#fffbeb', // Amber light
          500: '#d97706', // Warm amber accent
          600: '#b45309',
          700: '#92400e',
          900: '#78350f',
        },
        neutral: {
          50: '#f8fafc',  // Slate light background
          100: '#f1f5f9',
          800: '#1e293b', // Slate dark card background
          900: '#0f172a', // Slate dark body background
        },
        danger: {
          50: '#fef2f2',
          600: '#dc2626', // High contrast red for traps
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
