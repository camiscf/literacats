/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink-primary': '#F472B6',
        'pink-light': '#FCE7F3',
        'pink-hot': '#EC4899',
        'black': '#1A1A1A',
        'cream': '#FFF5F7',
        'red-accent': '#EF4444',
      },
      fontFamily: {
        'display': ['Fraunces', 'serif'],
        'body': ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
