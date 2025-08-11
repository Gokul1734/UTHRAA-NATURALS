import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Ensure proper handling of client-side routing
    historyApiFallback: true,
  },
  // Ensure proper build configuration for React Router
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
