/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        healthygo: {
          primary: '#10b981', // Green
          secondary: '#059669',
          accent: '#34d399',
          dark: '#047857',
        },
      },
    },
  },
  plugins: [],
}

