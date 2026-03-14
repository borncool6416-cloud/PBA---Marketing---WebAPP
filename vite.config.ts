import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  build: {
    rollupOptions: {
      external: ['hono/jsx/jsx-runtime', 'hono/jsx/jsx-dev-runtime'],
    }
  }
})
