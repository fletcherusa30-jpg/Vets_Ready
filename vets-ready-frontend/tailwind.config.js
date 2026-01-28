/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.tsx"
  ],
  theme: {
    extend: {
      colors: {
        'vets-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        'vets-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      textColor: {
        'accessible-primary': '#111827',     // High contrast dark text for light backgrounds (9:1)
        'accessible-secondary': '#4b5563',   // Secondary text for light backgrounds (7:1)
        'accessible-tertiary': '#6b7280',    // Tertiary text for light backgrounds (4.5:1 minimum)
        'accessible-light': '#ffffff',       // Light text for dark backgrounds (8:1+)
        'accessible-light-secondary': '#f3f4f6', // Light secondary for dark backgrounds
      },
      backgroundColor: {
        'accessible-success-light': '#f0fdf4',
        'accessible-warning-light': '#fffbeb',
        'accessible-danger-light': '#fef2f2',
        'accessible-info-light': '#eff6ff',
      },
    },
  },
  plugins: [],
}
