/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./*.{js,jsx,ts,tsx}", // Including root files as requested
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D7377",
        accent: "#F59E0B",
        teal: {
          light: "#E7F4F4",
          DEFAULT: "#0D7377",
          dark: "#0A5C5F",
        },
        amber: {
          light: "#FEF3C7",
          DEFAULT: "#F59E0B",
          dark: "#D97706",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          500: "#64748B",
          900: "#0F172A",
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "DM Sans", "sans-serif"],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
