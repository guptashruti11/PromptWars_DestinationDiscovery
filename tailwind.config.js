/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft, eye-friendly light blue palette inspired by Dal Lake
        brand: {
          50: '#f0f9ff',  // Soft light sky blue tint
          100: '#e0f2fe', // Very light blue select background
          400: '#0369a1', // Darker sky blue for high-contrast text highlighting
          500: '#0284c7', // Primary Sky Blue
          600: '#0369a1', // Deep Sky Blue
          700: '#075985', // Accent Indigo/Blue
          900: '#0c4a6e', // Darkest Blue
        },
        heritage: {
          50: '#fffbeb',  // Warm amber light tint
          500: '#d97706', // Warm Golden Amber (from the traditional shikhara boat)
          600: '#b45309',
          700: '#92400e',
          900: '#78350f',
        },
        neutral: {
          50: '#0f172a',   // Darkest text (Slate 900)
          100: '#1e293b',  // Primary body text (Slate 800)
          200: '#334155',  // Secondary text (Slate 700)
          300: '#475569',  // Medium grey-blue text (Slate 600)
          400: '#64748b',  // Soft slate-grey text (Slate 500)
          500: '#94a3b8',  // Muted text (Slate 400)
          600: '#cbd5e1',  // Soft border (Slate 300)
          700: '#e2e8f0',  // Light border (Slate 200)
          800: '#ffffff',  // Bright white card background
          900: '#f0f7ff',  // Soothing eye-friendly light sky-blue background
          955: '#e0f2fe',  // Soothing light blue footer background
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
