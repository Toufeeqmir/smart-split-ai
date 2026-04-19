/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#081321",
          slate: "#12304a",
          mist: "#edf4fb",
          teal: "#2d8f85",
          gold: "#c7913f",
        },
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Segoe UI", "Tahoma", "sans-serif"],
        display: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        panel: "0 28px 80px rgba(8, 19, 33, 0.14)",
        soft: "0 18px 40px rgba(18, 48, 74, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(18px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-8px)",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
