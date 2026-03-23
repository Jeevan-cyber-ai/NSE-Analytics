/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            "nse-blue": "#0d47a1",
            "nse-gold": "#ffd700",
            "bg-dark": "#0f172a",
        }
    },
  },
  plugins: [],
}
