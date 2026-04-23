/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        mb: {
          bg: 'var(--mb-bg)',
          surface: 'var(--mb-surface)',
          elevated: 'var(--mb-surface-elevated)',
          border: 'var(--mb-border)',
          'border-subtle': 'var(--mb-border-subtle)',
          primary: 'var(--mb-primary)',
          'primary-hover': 'var(--mb-primary-hover)',
          'text-primary': 'var(--mb-text-primary)',
          'text-secondary': 'var(--mb-text-secondary)',
          ring: 'var(--mb-ring)',
          'ring-offset': 'var(--mb-ring-offset)',
          danger: 'var(--mb-danger)',
          'danger-hover': 'var(--mb-danger-hover)',
        },
      },
      boxShadow: {
        'mb-card':
          '0 1px 2px rgb(15 23 42 / 0.04), 0 10px 28px -8px rgb(15 23 42 / 0.08)',
        'mb-card-dark':
          '0 1px 0 rgb(255 255 255 / 0.04), 0 14px 36px -10px rgb(0 0 0 / 0.55)',
        'mb-card-hover':
          '0 1px 2px rgb(15 23 42 / 0.05), 0 16px 40px -10px rgb(15 23 42 / 0.12)',
        'mb-card-hover-dark':
          '0 1px 0 rgb(255 255 255 / 0.06), 0 18px 44px -10px rgb(0 0 0 / 0.65)',
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 4px 20px -4px rgb(15 23 42 / 0.08)',
        'soft-dark':
          '0 1px 2px 0 rgb(0 0 0 / 0.25), 0 8px 28px -6px rgb(0 0 0 / 0.5)',
        surface:
          '0 1px 0 0 rgb(15 23 42 / 0.04), 0 6px 20px -6px rgb(15 23 42 / 0.07)',
        'surface-dark':
          '0 1px 0 0 rgb(255 255 255 / 0.04), 0 10px 28px -8px rgb(0 0 0 / 0.5)',
        modal:
          '0 24px 56px -16px rgb(15 23 42 / 0.18), 0 12px 28px -12px rgb(15 23 42 / 0.1)',
        'modal-dark':
          '0 28px 72px -16px rgb(0 0 0 / 0.72), 0 0 0 1px rgb(255 255 255 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
