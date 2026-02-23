/**
 * Inline Critical CSS Script
 * 
 * This script inlines critical CSS into the HTML <head> during build.
 * Critical CSS includes only the styles needed for above-the-fold content.
 * 
 * Usage: Run during build process to optimize First Contentful Paint (FCP)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CRITICAL_CSS_PATH = path.resolve(__dirname, '../src/styles/critical.css')
const HTML_PATH = path.resolve(__dirname, '../dist/index.html')

function inlineCriticalCSS() {
  try {
    // Read critical CSS
    const criticalCSS = fs.readFileSync(CRITICAL_CSS_PATH, 'utf-8')
    
    // Minify CSS (basic minification)
    const minifiedCSS = criticalCSS
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around punctuation
      .trim()
    
    // Read HTML file
    if (!fs.existsSync(HTML_PATH)) {
      console.log('⚠️  HTML file not found. Skipping critical CSS inlining.')
      return
    }
    
    let html = fs.readFileSync(HTML_PATH, 'utf-8')
    
    // Check if critical CSS is already inlined
    if (html.includes('<style id="critical-css">')) {
      console.log('✓ Critical CSS already inlined')
      return
    }
    
    // Create inline style tag
    const styleTag = `<style id="critical-css">${minifiedCSS}</style>`
    
    // Insert before closing </head> tag
    html = html.replace('</head>', `  ${styleTag}\n  </head>`)
    
    // Write updated HTML
    fs.writeFileSync(HTML_PATH, html, 'utf-8')
    
    console.log('✓ Critical CSS inlined successfully')
    console.log(`  Size: ${(minifiedCSS.length / 1024).toFixed(2)} KB`)
  } catch (error) {
    console.error('✗ Error inlining critical CSS:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  inlineCriticalCSS()
}

export default inlineCriticalCSS
