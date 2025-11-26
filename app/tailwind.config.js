/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cursor: {
          bg: '#1e1e1e',
          hover: '#2d2d30',
          active: '#37373d',
          border: '#3e3e42',
          text: '#cccccc',
          textDim: '#9d9d9d',
          accent: '#007acc'
        }
      }
    },
  },
  plugins: [],
}



