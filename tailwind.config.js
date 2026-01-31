/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Syne', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'radar': {
          'bg': '#0a0a0f',
          'card': '#12121a',
          'border': '#1e1e2e',
          'text': '#e4e4e7',
          'muted': '#71717a',
          'hot': '#f97316',
          'warm': '#eab308',
          'cold': '#3b82f6',
          'up': '#22c55e',
          'down': '#ef4444',
          'accent': '#f97316',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}
