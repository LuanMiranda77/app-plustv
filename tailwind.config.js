/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,tsx,ts,jsx,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        netflix: {
          dark: '#0a0a0a',
          card: '#141414',
          red: '#E50914',
          gray: '#221f1f',
        }
      },
      backgroundImage: {
        'netflix-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      }
    },
  },
  plugins: [],
}