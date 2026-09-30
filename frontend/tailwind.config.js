/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mibanco-sidebar': '#0f172a',
        'mibanco-sidebar-hover': '#1e293b',
        'mibanco-blue': '#1e40af',
        'mibanco-blue-light': '#3b82f6',
        'mibanco-bg': '#f1f5f9',
      }
    },
  },
  plugins: [],
}
