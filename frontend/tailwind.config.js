module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6',  // blue-500
          dark: '#1e40af',   // blue-800
        },
        accent: {
          DEFAULT: '#6366f1', // indigo-500
        },
        background: {
          DEFAULT: '#f8fafc', // blue-50
        },
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(37, 99, 235, 0.08)',
      },
    },
  },
  plugins: [],
};
