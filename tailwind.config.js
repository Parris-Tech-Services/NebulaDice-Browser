/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nebula: {
          ink: "#080b14",
          panel: "#121b2e",
          cyan: "#3ed8ff",
          ember: "#ff7a45",
          magenta: "#d14dff"
        }
      },
      boxShadow: {
        glow: "0 0 24px rgba(62,216,255,0.25)"
      }
    }
  },
  plugins: []
};
