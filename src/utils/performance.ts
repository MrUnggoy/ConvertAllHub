/**
 * Performance optimization utilities for managing main thread work
 * and ensuring fast interactivity (TTI < 2.5s)
 */

/**
 * Schedules a callback to run during idle time
 * Falls back to setTimeout if requestIdleCallback is not available
 * 
 * @param callback - The function to execute during idle time
 * @param options - Optional configuration for timeout
 * @returns A function to cancel the scheduled callback
 */
export function scheduleIdleTask(
  callback: () => void,
  options?: { timeout?: number }
): () => void {
  if ('requestIdleCallback' in window) {
    const id = requestIdleCallback(callback, options)
    return () => cancelIdleCallback(id)
  } else {
    // Fallback for browsers without requestIdleCallback
    const id = setTimeout(callback, 1)
    return () => clearTimeout(id)
  }
}

/**
 * Defers non-critical work to prevent blocking the main thread
 * Uses requestIdleCallback when available, otherwise uses setTimeout
 * 
 * @param work - The non-critical work to defer
 * @param timeout - Maximum time to wait before executing (default: 2000ms)
 */
export function deferNonCriticalWork(
  work: () => void,
  timeout: number = 2000
): void {
  scheduleIdleTask(work, { timeout })
}

/**
 * Breaks up long tasks into smaller chunks to prevent blocking
 * the main thread. Useful for processing large arrays or heavy computations.
 * 
 * @param items - Array of items to process
 * @param processItem - Function to process each item
 * @param chunkSize - Number of items to process per chunk (default: 50)
 * @returns Promise that resolves when all items are processed
 */
export async function processInChunks<T>(
  items: T[],
  processItem: (item: T, index: number) => void,
  chunkSize: number = 50
): Promise<void> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    
    // Process chunk
    chunk.forEach((item, chunkIndex) => {
      processItem(item, i + chunkIndex)
    })
    
    // Yield to browser to prevent blocking
    if (i + chunkSize < items.length) {
      await new Promise(resolve => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => resolve(undefined))
        } else {
          setTimeout(resolve, 0)
        }
      })
    }
  }
}

/**
 * Measures the time to interactive (TTI) for critical elements
 * Logs a warning if TTI exceeds the target threshold
 * 
 * @param elementSelector - CSS selector for the critical element
 * @param targetTTI - Target TTI in milliseconds (default: 2500ms)
 * @param startTime - Performance mark start time
 */
export function measureTimeToInteractive(
  elementSelector: string,
  targetTTI: number = 2500,
  startTime: number = performance.now()
): void {
  const element = document.querySelector(elementSelector)
  
  if (!element) {
    console.warn(`Element not found: ${elementSelector}`)
    return
  }

  // Check if element is interactive
  const isInteractive = 
    element instanceof HTMLElement &&
    !element.hasAttribute('disabled') &&
    !element.hasAttribute('aria-disabled')

  if (isInteractive) {
    const tti = performance.now() - startTime
    
    if (tti > targetTTI) {
      console.warn(
        `TTI exceeded target: ${tti.toFixed(2)}ms > ${targetTTI}ms for ${elementSelector}`
      )
    } else {
      console.log(
        `TTI within target: ${tti.toFixed(2)}ms <= ${targetTTI}ms for ${elementSelector}`
      )
    }
  }
}

/**
 * Optimizes event handlers by using passive listeners when appropriate
 * Passive listeners improve scrolling performance by telling the browser
 * that the handler won't call preventDefault()
 * 
 * @param element - The element to attach the listener to
 * @param event - The event type
 * @param handler - The event handler function
 * @param options - Additional options (passive is set to true by default for scroll/touch events)
 */
export function addOptimizedEventListener(
  element: HTMLElement | Window | Document,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  // Use passive listeners for scroll and touch events by default
  const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel']
  const shouldBePassive = passiveEvents.includes(event)
  
  const listenerOptions: AddEventListenerOptions = {
    passive: shouldBePassive,
    ...options
  }

  element.addEventListener(event, handler, listenerOptions)

  // Return cleanup function
  return () => {
    element.removeEventListener(event, handler, listenerOptions)
  }
}

/**
 * Throttles a function to execute at most once per specified interval
 * Useful for scroll and resize handlers to reduce main thread work
 * 
 * @param func - The function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Debounces a function to execute only after it stops being called
 * for a specified delay. Useful for search inputs and filter operations.
 * 
 * @param func - The function to debounce
 * @param delay - Delay in milliseconds to wait before executing
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function(this: any, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, delay)
  }
}
