// tailwind.config.js
// Configuration for Tailwind CSS with custom animations and utilities for the PlayerCard

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Custom animation keyframes
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(34, 197, 94, 0.5)' },
        },
        'glow-red': {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(239, 68, 68, 0.5)' },
        },
        'glow-blue': {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 15px 3px rgba(59, 130, 246, 0.4)' },
        },
      },
      // Custom animations
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'glow-green': 'glow-green 1.5s ease-in-out infinite',
        'glow-red': 'glow-red 1.5s ease-in-out infinite',
        'glow-blue': 'glow-blue 2s ease-in-out infinite',
      },
      // Custom colors for the dark theme
      colors: {
        'zinc': {
          750: '#2c2c35', // Custom color between zinc-700 and zinc-800
          850: '#1f1f25', // Custom color between zinc-800 and zinc-900
        },
      },
      // Custom border widths
      borderWidth: {
        '3': '3px',
      },
      // Custom box shadow options
      boxShadow: {
        'card-hover': '0 5px 15px 0 rgba(0, 0, 0, 0.35)',
        'card-correct': '0 0 15px 5px rgba(34, 197, 94, 0.25)',
        'card-incorrect': '0 0 15px 5px rgba(239, 68, 68, 0.25)',
        'card-timeout': '0 0 15px 5px rgba(59, 130, 246, 0.25)',
      },
    },
  },
  plugins: [
    // Add plugin for focus-visible polyfill
    require('@tailwindcss/forms'),
    // Custom plugin for child-friendly utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.focus-visible:focus': {
          'outline': '3px solid rgba(59, 130, 246, 0.6)',
          'outline-offset': '3px',
        },
      };
      addUtilities(newUtilities);
    }
  ],
  // Darkmode setting for better battery life
  darkMode: 'class',
};
