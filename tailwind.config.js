// tailwind.config.js or tailwind.config.ts
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  safelist: [
    "bg-green-500",
    "bg-yellow-400",
    "bg-red-500",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
