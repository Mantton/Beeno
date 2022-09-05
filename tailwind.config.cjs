/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple_primary: "#95A2F1",
        primary: "#000000",
        legendary: "#f8961e",
        ultra_rare: "#7b2cbf",
        rare: "#00c0f0",
        uncommon: "#ae2012",
        common: "#0ead69",
        dynamic_color: "var(--color)",
      },
      backgroundImage: {
        dynamic_image: "var(--url)",
      },
    },
  },
  plugins: [],
};
