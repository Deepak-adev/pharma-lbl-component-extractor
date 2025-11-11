/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0D47A1',
        'brand-blue-light': '#E3F2FD',
        'brand-secondary': '#1976D2',
        'brand-accent': '#FFC107',
        'base-100': '#FFFFFF',
        'base-200': '#F7FAFC',
        'base-300': '#E2E8F0',
        'text-primary': '#1A202C',
        'text-secondary': '#4A5568',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.07)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}