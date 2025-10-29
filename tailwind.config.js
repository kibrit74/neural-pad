/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-text': 'var(--color-primary-text)',
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        backdrop: 'var(--color-backdrop)',
      },
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        'modal-enter': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'modal-exit': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'modal-content-enter': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'modal-content-exit': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
      },
      animation: {
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out both',
        'modal-enter': 'modal-enter 0.3s ease-out',
        'modal-exit': 'modal-exit 0.2s ease-in',
        'modal-content-enter': 'modal-content-enter 0.3s ease-out',
        'modal-content-exit': 'modal-content-exit 0.2s ease-in',
      },
    },
  },
  plugins: [],
}
