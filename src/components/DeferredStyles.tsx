/**
 * DeferredStyles Component
 * 
 * This component loads non-critical CSS asynchronously after the page has rendered.
 * It helps optimize First Contentful Paint (FCP) by deferring non-essential styles.
 * 
 * Validates: Requirements 9.1, 9.3 (Performance optimization)
 * 
 * Usage:
 * Place this component at the end of your main App component to load
 * non-critical styles after the initial render.
 */

import { useEffect } from 'react'
import { loadDeferredCSS } from '@/utils/defer-css'

interface DeferredStylesProps {
  /**
   * Array of CSS file URLs to load asynchronously
   */
  stylesheets?: string[]
  
  /**
   * Delay in milliseconds before loading styles (default: 0)
   * Use a small delay (e.g., 100ms) to ensure critical content renders first
   */
  delay?: number
}

export default function DeferredStyles({ 
  stylesheets = [], 
  delay = 0 
}: DeferredStylesProps) {
  useEffect(() => {
    // Load deferred styles after a delay
    const timeoutId = setTimeout(() => {
      stylesheets.forEach(href => {
        loadDeferredCSS(href)
      })
    }, delay)
    
    return () => clearTimeout(timeoutId)
  }, [stylesheets, delay])
  
  // This component doesn't render anything
  return null
}

/**
 * Hook to load CSS on demand
 * 
 * @param href - URL of the CSS file to load
 * @param condition - Boolean condition to trigger loading (default: true)
 * 
 * @example
 * // Load CSS when a feature is enabled
 * useDeferredCSS('/styles/feature.css', isFeatureEnabled)
 */
export function useDeferredCSS(href: string, condition: boolean = true) {
  useEffect(() => {
    if (condition) {
      loadDeferredCSS(href)
    }
  }, [href, condition])
}

/**
 * Hook to load CSS when component is visible
 * 
 * @param href - URL of the CSS file to load
 * @param ref - React ref to the element to observe
 * 
 * @example
 * const ref = useRef<HTMLDivElement>(null)
 * useDeferredCSSOnVisible('/styles/below-fold.css', ref)
 * return <div ref={ref}>Content</div>
 */
export function useDeferredCSSOnVisible(
  href: string, 
  ref: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!ref.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadDeferredCSS(href)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )
    
    observer.observe(ref.current)
    
    return () => observer.disconnect()
  }, [href, ref])
}
