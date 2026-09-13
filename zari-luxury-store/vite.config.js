import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Allow any host so the app works behind preview/proxy domains (e.g. *.e2b.app)
    allowedHosts: true,
    // All API calls use the relative path /api, proxied to the backend server
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
    },
  },
})
