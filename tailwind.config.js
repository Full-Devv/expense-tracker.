/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
          },
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
          },
        }
      },
    },
    plugins: [],
  }