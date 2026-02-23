import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import criticalCSSPlugin from './vite-plugin-critical-css'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    criticalCSSPlugin({
      criticalCSSPath: 'src/styles/critical.css',
      minify: true
    })
  ],
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
          // Core React libraries - loaded on every page
          'react-vendor': ['react', 'react-dom'],
          
          // Router - loaded on every page
          'react-router': ['react-router-dom'],
          
          // PDF processing libraries - only loaded when PDF tools are used
          'pdf-tools': ['pdfjs-dist', 'pdf-lib', 'jspdf'],
          
          // UI component libraries - loaded as needed
          'ui-components': [
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select', 
            '@radix-ui/react-tabs', 
            '@radix-ui/react-progress',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch'
          ],
          
          // Heavy image processing - only loaded for background removal tool
          'image-processing': ['@imgly/background-removal'],
          
          // Document processing - only loaded for document conversion tools
          'document-tools': ['mammoth', 'jszip'],
          
          // Utilities - shared across multiple components
          'utilities': ['clsx', 'tailwind-merge', 'lucide-react']
        },
      },
    },
    // Increase chunk size warning limit for large libraries
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting for better caching and loading
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