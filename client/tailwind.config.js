/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f0',
          100: '#fae3df',
          200: '#f5c3b8',
          300: '#eb8d78',
          400: '#da664e',
          500: '#be4933',
          600: '#a33b26', // Crimson accent
          700: '#800000', // Heritage Maroon
          800: '#64101e',
          850: '#4d0c16',
          900: '#380a11',
          950: '#1e0508',
        },
        gold: {
          950: '#1a1304',
          900: '#332408',
          800: '#5c410e',
          700: '#805d15',
          600: '#a4773a', // Regal Gold
          500: '#c59238',
          400: '#d49b25', // Radiant Gold
          300: '#e7b958',
          200: '#f3d48d',
          100: '#faecc8',
        },
        zinc: {
          850: '#1f1f23',
          925: '#111115',
          950: '#09090c',
          975: '#040406',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(212, 155, 37, 0.4)',
        'glow-gold-lg': '0 0 40px -5px rgba(212, 155, 37, 0.6)',
        'glow-maroon': '0 0 25px -5px rgba(163, 59, 38, 0.45)',
        'glow-maroon-lg': '0 0 45px -5px rgba(128, 0, 0, 0.65)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
};
