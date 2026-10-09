/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: { 100: '#FEF3C7', 300: '#FCD34D', 500: '#F59E0B', 600: '#D97706' },
        ink: { 300: '#94A3B8', 500: '#64748B', 700: '#334155', 900: '#0F172A' },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
          line: '#E2E8F0',
          page: '#F1F5F9',
        },
        state: {
          success: '#16A34A',
          danger: '#DC2626',
          warn: '#F59E0B',
          info: '#2563EB',
        },
      },
      borderRadius: { xl: '16px', '2xl': '20px', '3xl': '28px' },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)',
        float: '0 12px 40px rgba(15,23,42,.10)',
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
