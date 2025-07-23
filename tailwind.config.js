const { light, dark } = require('@charcoal-ui/theme')
const { createTailwindConfig } = require('@charcoal-ui/tailwind-config')
/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './public/js/*.{js,ts,jsx,tsx}',
  ],
  presets: [
    createTailwindConfig({
      version: 'v3',
      theme: {
        ':root': light,
      },
    }),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004099',
        'primary-hover': '#005ee0',
        'primary-press': '#056eff',
        'primary-disabled': '#70acff',
        secondary: '#004099',
        'secondary-hover': '#005ee0',
        'secondary-press': '#056eff',
        'secondary-disabled': '#70acff',
        base: '#FBE2CA',
        'text-primary': '#514062',
        ocuro: '#002864',
        'ocuro-hover': '#003c95',
        'ocuro-press': '#0049b6',
        'ocuro-disabled': '#DCE0E5',
      },
      fontFamily: {
        M_PLUS_2: ['Montserrat', 'M_PLUS_2', 'sans-serif'],
        Montserrat: ['Montserrat', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      width: {
        '1/2': '50%',
      },
      zIndex: {
        5: '5',
        15: '15',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
    },
  },
}
