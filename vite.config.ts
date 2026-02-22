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
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf-tools': ['pdfjs-dist', 'pdf-lib', 'jspdf'],
          'ui-components': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-progress'],
          'image-tools': ['@imgly/background-removal'],
          'utilities': ['jszip', 'mammoth', 'clsx', 'tailwind-merge']
        },
      },
    },
    // Increase chunk size warning limit for large libraries
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  // Enable compression and caching headers
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@imgly/background-removal'], // Large library, load on demand
  },
})