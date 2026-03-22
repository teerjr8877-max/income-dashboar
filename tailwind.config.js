/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ac2ff',
          400: '#529eff',
          500: '#2b7fff',
          600: '#155ff0',
          700: '#124bdb',
          800: '#163dae',
          900: '#193989',
        },
      },
      boxShadow: {
        panel: '0 10px 40px rgba(15, 23, 42, 0.22)',
      },
    },
  },
  plugins: [],
}
