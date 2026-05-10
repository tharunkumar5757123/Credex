/** @type {import('tailwindcss').Config} */
export default {
  content: {
    relative: true,
    files: ['./index.html', './frontend/src/**/*.{js,jsx}'],
  },
  theme: {
    extend: {
      boxShadow: {
        glow: '0 24px 70px rgba(15, 23, 42, 0.16)',
        'inner-soft': 'inset 0 1px 0 rgba(255,255,255,0.7)',
      },
      animation: {
        'fade-up': 'fadeUp 720ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        'scale-in': 'scaleIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
