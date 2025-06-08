/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        squada: ['"Squada One"', "cursive"],
        roboto: ['"Roboto"', "sans-serif"],
      },
      width: {
        "3/7": "42.857%" /* 3/7 = 0.42857142857 */,
        "3/8": "37.5%" /* 3/8 = 0.375 */,
        "5/8": "62.5%" /* 5/8 = 0.625 */,
      },
      colors: {
        "custom-blue": "#7787B9",
        "navy-dark": "#233B4F",
      },
    },
  },
  plugins: [],
};
