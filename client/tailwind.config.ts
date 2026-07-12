import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5B6E4F',
        primaryDark: '#3F4E37',
        ink: '#26241E',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: '#F3EFE7',
        card: '#FFFFFF',
        cream: '#FAF7F0',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(38,36,30,0.06)',
        soft: '0 2px 12px rgba(38,36,30,0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config
