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
      screens: {
        'xs': '360px', // Extra small devices (small phones)
        '4k': '2560px', // 4K UHD and above (3840 × 2160)
      },
    },
  },
  plugins: [],
}

