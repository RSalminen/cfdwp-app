/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'wave1': "url(../public/wavebg1.svg)",
        'wave2': "url(../public/wavebg2.svg)"
      }
    },
  },
  plugins: [],
}
