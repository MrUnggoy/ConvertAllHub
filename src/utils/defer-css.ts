/**
 * Defer Non-Critical CSS Loading
 * 
 * This utility defers loading of non-critical CSS to improve First Contentful Paint.
 * Non-critical CSS is loaded asynchronously after the page has rendered.
 * 
 * Validates: Requirements 9.1, 9.3 (Performance optimization)
 */

/**
 * Load CSS file asynchronously
 * @param href - URL of the CSS file to load
 * @param media - Media query for the stylesheet (default: 'all')
 */
export function loadDeferredCSS(href: string, media: string = 'all'): void {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.media = 'print' // Initially set to print to avoid blocking
  link.onload = function() {
    // Once loaded, change media to 'all' to apply styles
    link.media = media
  }
  
  // Fallback for browsers that don't support onload
  setTimeout(() => {
    link.media = media
  }, 3000)
  
  document.head.appendChild(link)
}

/**
 * Load multiple CSS files asynchronously
 * @param cssFiles - Array of CSS file URLs to load
 */
export function loadDeferredCSSFiles(cssFiles: string[]): void {
  cssFiles.forEach(href => loadDeferredCSS(href))
}

/**
 * Preload CSS file for faster loading
 * @param href - URL of the CSS file to preload
 */
export function preloadCSS(href: string): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'style'
  link.href = href
  link.onload = function() {
    // Convert preload to stylesheet
    link.rel = 'stylesheet'
  }
  document.head.appendChild(link)
}

/**
 * Load CSS with intersection observer (load when element is visible)
 * @param href - URL of the CSS file to load
 * @param targetSelector - CSS selector of element to observe
 */
export function loadCSSOnVisible(href: string, targetSelector: string): void {
  const target = document.querySelector(targetSelector)
  
  if (!target) {
    // If target doesn't exist, load immediately
    loadDeferredCSS(href)
    return
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadDeferredCSS(href)
        observer.disconnect()
      }
    })
  }, {
    rootMargin: '50px' // Load 50px before element is visible
  })
  
  observer.observe(target)
}

/**
 * Check if CSS file is already loaded
 * @param href - URL of the CSS file to check
 * @returns true if CSS is already loaded
 */
export function isCSSLoaded(href: string): boolean {
  const links = document.querySelectorAll('link[rel="stylesheet"]')
  return Array.from(links).some(link => 
    (link as HTMLLinkElement).href.includes(href)
  )
}

/**
 * Load CSS only if not already loaded
 * @param href - URL of the CSS file to load
 */
export function loadCSSOnce(href: string): void {
  if (!isCSSLoaded(href)) {
    loadDeferredCSS(href)
  }
}
