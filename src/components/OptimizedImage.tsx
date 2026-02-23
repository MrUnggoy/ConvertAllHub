import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * OptimizedImage Component
 * 
 * Provides optimized image loading with:
 * - WebP format with fallbacks
 * - Responsive images with srcset
 * - Lazy loading for below-fold images
 * - Optimized for Largest Contentful Paint (LCP)
 * 
 * Validates: Requirement 9.4
 */

export interface ImageSource {
  src: string
  width: number
  format?: 'webp' | 'jpg' | 'png'
}

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  sources?: ImageSource[]
  priority?: boolean // If true, loads eagerly (for LCP images)
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onLoad?: () => void
  onError?: () => void
}

/**
 * OptimizedImage component with WebP support, responsive images, and lazy loading
 * 
 * Usage:
 * ```tsx
 * // Simple usage
 * <OptimizedImage src="/hero.jpg" alt="Hero image" priority />
 * 
 * // With responsive sources
 * <OptimizedImage 
 *   src="/hero.jpg" 
 *   alt="Hero image"
 *   sources={[
 *     { src: '/hero-320.webp', width: 320, format: 'webp' },
 *     { src: '/hero-640.webp', width: 640, format: 'webp' },
 *     { src: '/hero-1024.webp', width: 1024, format: 'webp' },
 *   ]}
 *   priority
 * />
 * ```
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sources = [],
  priority = false,
  className,
  objectFit = 'cover',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Priority images are always "in view"
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    )

    observer.observe(imgRef.current)

    return () => {
      observer.disconnect()
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate srcset from sources
  const generateSrcSet = (format?: 'webp' | 'jpg' | 'png') => {
    const filteredSources = format
      ? sources.filter((s) => s.format === format)
      : sources.filter((s) => !s.format || s.format !== 'webp')

    if (filteredSources.length === 0) return undefined

    return filteredSources
      .map((source) => `${source.src} ${source.width}w`)
      .join(', ')
  }

  // Generate sizes attribute for responsive images
  const generateSizes = () => {
    if (sources.length === 0) return undefined
    
    // Default responsive sizes
    return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px'
  }

  const webpSrcSet = generateSrcSet('webp')
  const fallbackSrcSet = generateSrcSet()
  const sizes = generateSizes()

  return (
    <picture ref={imgRef as any}>
      {/* WebP sources for modern browsers */}
      {webpSrcSet && (
        <source
          type="image/webp"
          srcSet={isInView ? webpSrcSet : undefined}
          sizes={sizes}
        />
      )}

      {/* Fallback sources for older browsers */}
      {fallbackSrcSet && (
        <source
          srcSet={isInView ? fallbackSrcSet : undefined}
          sizes={sizes}
        />
      )}

      {/* Main image element */}
      <img
        src={isInView ? src : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'hidden',
          className
        )}
        style={{
          objectFit,
        }}
      />

      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse',
            className
          )}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : '100%',
          }}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400',
            className
          )}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : '100%',
          }}
        >
          <span className="text-sm">Image failed to load</span>
        </div>
      )}
    </picture>
  )
}
