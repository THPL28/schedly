/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        sidebar: {
          bg: '#111827',
        },
        background: '#f8fafc',
        foreground: '#1e293b',
        muted: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        danger: '#ef4444',
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
        md: '0.75rem',
      },
    },
  },
  plugins: [],
}

