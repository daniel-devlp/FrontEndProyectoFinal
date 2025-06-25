import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorar advertencias de TypeScript
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        if (warning.code === 'UNRESOLVED_IMPORT') return
        warn(warning)
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-bootstrap', 'react-select', 'react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
