import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'Segoe UI', 'Microsoft YaHei UI', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'Microsoft YaHei UI', 'sans-serif']
      },
      colors: {
        panel: '#111522',
        ink: '#edf3ff',
        muted: '#8593aa',
        neon: '#48f4ff',
        ember: '#ffb347',
        danger: '#ff4f6d'
      },
      boxShadow: {
        glow: '0 0 24px rgba(72, 244, 255, 0.18)',
        danger: '0 0 24px rgba(255, 79, 109, 0.16)'
      }
    }
  },
  plugins: []
} satisfies Config;
