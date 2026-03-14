/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pba-burgundy': '#802035',
        'pba-pink': '#F9E1E1',
        'pba-gray': '#8E8E8E',
        'pba-white': '#FFFFFF',
      },
      fontFamily: {
        'cormorant': ['Cormorant Garamond', 'serif'],
        'jost': ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
