/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 这行必须要有
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
