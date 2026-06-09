import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A1A2E',
        gold: '#C9A96E',
        goldLight: '#F0E0B8',
        surface: '#F8F5F0',
        card: '#FFFFFF'
      },
      boxShadow: {
        soft: '0 8px 20px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
} satisfies Config
