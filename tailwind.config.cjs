/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next", "Avenir", "Segoe UI", "sans-serif"]
      },
      colors: {
        ui: {
          bg: "#f3f5f7",
          panel: "#ffffff",
          line: "#d9e2ec",
          text: "#102a43"
        },
        action: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8"
        }
      },
      boxShadow: {
        calm: "0 10px 30px -20px rgba(16, 42, 67, 0.35)"
      }
    }
  },
  plugins: []
};
