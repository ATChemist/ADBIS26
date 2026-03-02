/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f7ff",
          100: "#dfeeff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8"
        },
        success: {
          50: "#eefdf3",
          600: "#16a34a",
          700: "#15803d"
        },
        warning: {
          50: "#fff9eb",
          600: "#d97706",
          700: "#b45309"
        },
        danger: {
          50: "#fff1f2",
          600: "#dc2626",
          700: "#b91c1c"
        }
      },
      boxShadow: {
        panel: "0 6px 24px -16px rgba(15, 23, 42, 0.2)",
        focus: "0 0 0 3px rgba(37, 99, 235, 0.25)"
      }
    }
  },
  plugins: []
};
