import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/interactive-activation-model/',
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
