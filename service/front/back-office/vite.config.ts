import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: ['bo.localhost'],
    hmr: {
      host: 'bo.localhost',
      port: 80,
      protocol: 'ws',
    },
    watch: {
      usePolling: false,
    },
    proxy: {
      '/api/bo': {
        target: 'http://cyna-gateway-api:3000',
        changeOrigin: true,
      },
      '/api/file': {
        target: 'http://file-service:3004',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://cyna-gateway-api:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://cyna-gateway-api:3000',
        changeOrigin: true,
      }
    }
  }
})