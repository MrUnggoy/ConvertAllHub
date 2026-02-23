/**
 * Image Optimization Utilities
 * 
 * Utilities for generating optimized image sources with WebP support
 * and responsive image configurations.
 * 
 * Validates: Requirement 9.4
 */

export interface ImageConfig {
  basePath: string
  baseFilename: string
  extension: 'jpg' | 'png' | 'gif'
  sizes: number[]
  formats?: ('webp' | 'jpg' | 'png')[]
}

export interface GeneratedImageSource {
  src: string
  width: number
  format?: 'webp' | 'jpg' | 'png'
}

/**
 * Generate image sources for responsive images with WebP support
 * 
 * @param config - Image configuration
 * @returns Array of image sources for srcset
 * 
 * @example
 * ```ts
 * const sources = generateImageSources({
 *   basePath: '/images',
 *   baseFilename: 'hero',
 *   extension: 'jpg',
 *   sizes: [320, 640, 1024, 1920],
 *   formats: ['webp', 'jpg']
 * })
 * // Returns:
 * // [
 * //   { src: '/images/hero-320.webp', width: 320, format: 'webp' },
 * //   { src: '/images/hero-640.webp', width: 640, format: 'webp' },
 * //   { src: '/images/hero-1024.webp', width: 1024, format: 'webp' },
 * //   { src: '/images/hero-1920.webp', width: 1920, format: 'webp' },
 * //   { src: '/images/hero-320.jpg', width: 320, format: 'jpg' },
 * //   { src: '/images/hero-640.jpg', width: 640, format: 'jpg' },
 * //   { src: '/images/hero-1024.jpg', width: 1024, format: 'jpg' },
 * //   { src: '/images/hero-1920.jpg', width: 1920, format: 'jpg' },
 * // ]
 * ```
 */
export function generateImageSources(config: ImageConfig): GeneratedImageSource[] {
  const { basePath, baseFilename, extension, sizes, formats = ['webp', extension] } = config
  const sources: GeneratedImageSource[] = []

  // Generate sources for each format
  formats.forEach((format) => {
    sizes.forEach((width) => {
      sources.push({
        src: `${basePath}/${baseFilename}-${width}.${format}`,
        width,
        format: format as 'webp' | 'jpg' | 'png',
      })
    })
  })

  return sources
}

/**
 * Get the optimal image format based on browser support
 * 
 * @returns The optimal image format ('webp' or 'jpg')
 */
export function getOptimalImageFormat(): 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'jpg'

  // Check WebP support
  const canvas = document.createElement('canvas')
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check if browser supports WebP
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'webp' : 'jpg'
  }

  return 'jpg'
}

/**
 * Calculate responsive image sizes based on viewport breakpoints
 * 
 * @param maxWidth - Maximum width of the image in pixels
 * @returns CSS sizes attribute value
 * 
 * @example
 * ```ts
 * const sizes = calculateResponsiveSizes(1200)
 * // Returns: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
 * ```
 */
export function calculateResponsiveSizes(maxWidth: number): string {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 80vw, ${maxWidth}px`
}

/**
 * Preload critical images for LCP optimization
 * 
 * @param src - Image source URL
 * @param srcset - Optional srcset for responsive images
 * @param type - Image MIME type (default: 'image/webp')
 * 
 * @example
 * ```ts
 * preloadImage('/hero.webp', '/hero-320.webp 320w, /hero-640.webp 640w', 'image/webp')
 * ```
 */
export function preloadImage(
  src: string,
  srcset?: string,
  type: string = 'image/webp'
): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  
  if (srcset) {
    link.setAttribute('imagesrcset', srcset)
  }
  
  if (type) {
    link.type = type
  }

  document.head.appendChild(link)
}

/**
 * Standard responsive breakpoints for image optimization
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 320,
  mobileLarge: 480,
  tablet: 640,
  tabletLarge: 768,
  desktop: 1024,
  desktopLarge: 1280,
  wide: 1920,
} as const

/**
 * Generate standard responsive image sizes
 * 
 * @param includeWide - Whether to include wide desktop size (default: true)
 * @returns Array of standard responsive widths
 */
export function getStandardImageSizes(includeWide: boolean = true): number[] {
  const sizes = [
    RESPONSIVE_BREAKPOINTS.mobile,
    RESPONSIVE_BREAKPOINTS.tablet,
    RESPONSIVE_BREAKPOINTS.desktop,
    RESPONSIVE_BREAKPOINTS.desktopLarge,
  ]

  if (includeWide) {
    sizes.push(RESPONSIVE_BREAKPOINTS.wide)
  }

  return sizes
}
