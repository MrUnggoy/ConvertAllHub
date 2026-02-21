import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for production
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          pdf: ['pdfjs-dist', 'pdf-lib', 'jspdf'],
          ui: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs']
        }
      }
    },
    // Increase chunk size warning limit for large libraries
    chunkSizeWarningLimit: 1000
  },
  // Enable compression and caching headers
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})