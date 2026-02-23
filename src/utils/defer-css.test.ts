/**
 * Tests for CSS Deferral Utilities
 * 
 * Validates: Requirements 9.1, 9.3 (CSS optimization for FCP)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  loadDeferredCSS, 
  loadDeferredCSSFiles,
  isCSSLoaded,
  loadCSSOnce 
} from './defer-css'

describe('defer-css utilities', () => {
  beforeEach(() => {
    // Clear document head before each test
    document.head.innerHTML = ''
  })

  describe('loadDeferredCSS', () => {
    it('should create a link element with correct attributes', () => {
      loadDeferredCSS('/test.css')
      
      const link = document.querySelector('link[href="/test.css"]') as HTMLLinkElement
      expect(link).toBeTruthy()
      expect(link.rel).toBe('stylesheet')
      expect(link.media).toBe('print') // Initially set to print
    })

    it('should change media to "all" after load', (done) => {
      loadDeferredCSS('/test.css')
      
      const link = document.querySelector('link[href="/test.css"]') as HTMLLinkElement
      
      // Simulate load event
      link.onload?.(new Event('load'))
      
      // Check media changed to 'all'
      setTimeout(() => {
        expect(link.media).toBe('all')
        done()
      }, 10)
    })

    it('should support custom media queries', () => {
      loadDeferredCSS('/test.css', 'screen and (min-width: 768px)')
      
      const link = document.querySelector('link[href="/test.css"]') as HTMLLinkElement
      expect(link).toBeTruthy()
    })

    it('should have fallback timeout for media change', (done) => {
      vi.useFakeTimers()
      
      loadDeferredCSS('/test.css')
      
      const link = document.querySelector('link[href="/test.css"]') as HTMLLinkElement
      
      // Fast-forward time
      vi.advanceTimersByTime(3000)
      
      setTimeout(() => {
        expect(link.media).toBe('all')
        vi.useRealTimers()
        done()
      }, 10)
    })
  })

  describe('loadDeferredCSSFiles', () => {
    it('should load multiple CSS files', () => {
      const files = ['/test1.css', '/test2.css', '/test3.css']
      loadDeferredCSSFiles(files)
      
      files.forEach(file => {
        const link = document.querySelector(`link[href="${file}"]`)
        expect(link).toBeTruthy()
      })
    })

    it('should handle empty array', () => {
      loadDeferredCSSFiles([])
      
      const links = document.querySelectorAll('link[rel="stylesheet"]')
      expect(links.length).toBe(0)
    })
  })

  describe('isCSSLoaded', () => {
    it('should return false when CSS is not loaded', () => {
      expect(isCSSLoaded('/test.css')).toBe(false)
    })

    it('should return true when CSS is loaded', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'http://localhost/test.css'
      document.head.appendChild(link)
      
      expect(isCSSLoaded('/test.css')).toBe(true)
    })

    it('should handle partial URL matches', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'http://localhost/styles/test.css'
      document.head.appendChild(link)
      
      expect(isCSSLoaded('test.css')).toBe(true)
    })
  })

  describe('loadCSSOnce', () => {
    it('should load CSS if not already loaded', () => {
      loadCSSOnce('/test.css')
      
      const link = document.querySelector('link[href="/test.css"]')
      expect(link).toBeTruthy()
    })

    it('should not load CSS if already loaded', () => {
      // Load CSS first time
      loadCSSOnce('/test.css')
      
      // Try to load again
      loadCSSOnce('/test.css')
      
      // Should only have one link element
      const links = document.querySelectorAll('link[href="/test.css"]')
      expect(links.length).toBe(1)
    })
  })

  describe('performance considerations', () => {
    it('should not block rendering', () => {
      const startTime = performance.now()
      
      loadDeferredCSS('/test.css')
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete in less than 10ms (non-blocking)
      expect(duration).toBeLessThan(10)
    })

    it('should handle multiple concurrent loads', () => {
      const files = Array.from({ length: 10 }, (_, i) => `/test${i}.css`)
      
      files.forEach(file => loadDeferredCSS(file))
      
      files.forEach(file => {
        const link = document.querySelector(`link[href="${file}"]`)
        expect(link).toBeTruthy()
      })
    })
  })
})
