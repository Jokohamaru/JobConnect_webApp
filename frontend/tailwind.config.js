/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter"],
      },
    },
  },
  // tailwind.config.js
  plugins: [require("@tailwindcss/line-clamp")],
};
