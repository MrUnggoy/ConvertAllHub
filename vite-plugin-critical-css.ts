/**
 * Vite Plugin: Critical CSS
 * 
 * This plugin extracts and inlines critical CSS into the HTML <head> during build.
 * It helps optimize First Contentful Paint (FCP) by ensuring critical styles load immediately.
 * 
 * Validates: Requirements 9.1, 9.3 (Performance optimization)
 */

import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

interface CriticalCSSOptions {
  criticalCSSPath?: string
  minify?: boolean
}

export default function criticalCSSPlugin(options: CriticalCSSOptions = {}): Plugin {
  const {
    criticalCSSPath = 'src/styles/critical.css',
    minify = true
  } = options

  return {
    name: 'vite-plugin-critical-css',
    enforce: 'post',
    
    transformIndexHtml: {
      order: 'post',
      handler(html: string) {
        try {
          // Read critical CSS file
          const criticalCSSFullPath = path.resolve(process.cwd(), criticalCSSPath)
          
          if (!fs.existsSync(criticalCSSFullPath)) {
            console.warn(`⚠️  Critical CSS file not found: ${criticalCSSPath}`)
            return html
          }
          
          let criticalCSS = fs.readFileSync(criticalCSSFullPath, 'utf-8')
          
          // Minify CSS if enabled
          if (minify) {
            criticalCSS = criticalCSS
              .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
              .replace(/\s+/g, ' ') // Collapse whitespace
              .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
              .replace(/;\}/g, '}') // Remove last semicolon in blocks
              .trim()
          }
          
          // Check if critical CSS is already inlined
          if (html.includes('<style id="critical-css">')) {
            return html
          }
          
          // Create inline style tag
          const styleTag = `<style id="critical-css">${criticalCSS}</style>`
          
          // Insert before closing </head> tag
          const updatedHtml = html.replace('</head>', `  ${styleTag}\n  </head>`)
          
          console.log('✓ Critical CSS inlined successfully')
          console.log(`  Size: ${(criticalCSS.length / 1024).toFixed(2)} KB`)
          
          return updatedHtml
        } catch (error) {
          console.error('✗ Error inlining critical CSS:', error)
          return html
        }
      }
    }
  }
}
