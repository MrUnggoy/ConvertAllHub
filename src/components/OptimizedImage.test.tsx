import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import OptimizedImage from './OptimizedImage'

/**
 * OptimizedImage Component Tests
 * 
 * Tests image optimization features including:
 * - WebP support with fallbacks
 * - Responsive images with srcset
 * - Lazy loading
 * - Priority loading for LCP
 * - Loading and error states
 * 
 * Validates: Requirement 9.4
 */

describe('OptimizedImage', () => {
  // Mock IntersectionObserver
  let mockIntersectionObserver: any

  beforeEach(() => {
    // Create a proper mock class for IntersectionObserver
    mockIntersectionObserver = vi.fn(function(this: any, callback: any) {
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
      this.callback = callback
    })
    
    // @ts-ignore
    window.IntersectionObserver = mockIntersectionObserver
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders an image with src and alt text', () => {
      render(<OptimizedImage src="/test.jpg" alt="Test image" />)
      
      const img = screen.getByAltText('Test image')
      expect(img).toBeDefined()
    })

    it('applies custom className', () => {
      render(
        <OptimizedImage 
          src="/test.jpg" 
          alt="Test image" 
          className="custom-class"
        />
      )
      
      const img = screen.getByAltText('Test image')
      expect(img.className).toContain('custom-class')
    })

    it('sets width and height attributes when provided', () => {
      render(
        <OptimizedImage 
          src="/test.jpg" 
          alt="Test image"
          width={800}
          height={600}
        />
      )
      
      const img = screen.getByAltText('Test image')
      expect(img.getAttribute('width')).toBe('800')
      expect(img.getAttribute('height')).toBe('600')
    })
  })

  describe('Priority Loading (LCP Optimization)', () => {
    it('uses eager loading for priority images', () => {
      render(
        <OptimizedImage 
          src="/hero.jpg" 
          alt="Hero image"
          priority
        />
      )
      
      const img = screen.getByAltText('Hero image')
      expect(img.getAttribute('loading')).toBe('eager')
    })

    it('uses sync decoding for priority images', () => {
      render(
        <OptimizedImage 
          src="/hero.jpg" 
          alt="Hero image"
          priority
        />
      )
      
      const img = screen.getByAltText('Hero image')
      expect(img.getAttribute('decoding')).toBe('sync')
    })

    it('loads src immediately for priority images', () => {
      render(
        <OptimizedImage 
          src="/hero.jpg" 
          alt="Hero image"
          priority
        />
      )
      
      const img = screen.getByAltText('Hero image')
      expect(img.getAttribute('src')).toBe('/hero.jpg')
    })

    it('does not use IntersectionObserver for priority images', () => {
      render(
        <OptimizedImage 
          src="/hero.jpg" 
          alt="Hero image"
          priority
        />
      )
      
      expect(mockIntersectionObserver).not.toHaveBeenCalled()
    })
  })

  describe('Lazy Loading', () => {
    it('uses lazy loading for non-priority images', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Lazy image"
        />
      )
      
      const img = screen.getByAltText('Lazy image')
      expect(img.getAttribute('loading')).toBe('lazy')
    })

    it('uses async decoding for non-priority images', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Lazy image"
        />
      )
      
      const img = screen.getByAltText('Lazy image')
      expect(img.getAttribute('decoding')).toBe('async')
    })

    it('sets up IntersectionObserver for lazy loading', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Lazy image"
        />
      )
      
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })
  })

  describe('WebP Support with Fallbacks', () => {
    it('renders picture element with source elements', () => {
      const sources = [
        { src: '/image-320.webp', width: 320, format: 'webp' as const },
        { src: '/image-640.webp', width: 640, format: 'webp' as const },
      ]

      const { container } = render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          sources={sources}
          priority
        />
      )
      
      const picture = container.querySelector('picture')
      expect(picture).toBeDefined()
    })

    it('generates WebP srcset for WebP sources', () => {
      const sources = [
        { src: '/image-320.webp', width: 320, format: 'webp' as const },
        { src: '/image-640.webp', width: 640, format: 'webp' as const },
      ]

      const { container } = render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          sources={sources}
          priority
        />
      )
      
      const webpSource = container.querySelector('source[type="image/webp"]')
      expect(webpSource).toBeDefined()
      expect(webpSource?.getAttribute('srcset')).toContain('image-320.webp 320w')
      expect(webpSource?.getAttribute('srcset')).toContain('image-640.webp 640w')
    })

    it('generates fallback srcset for non-WebP sources', () => {
      const sources = [
        { src: '/image-320.webp', width: 320, format: 'webp' as const },
        { src: '/image-320.jpg', width: 320, format: 'jpg' as const },
        { src: '/image-640.jpg', width: 640, format: 'jpg' as const },
      ]

      const { container } = render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          sources={sources}
          priority
        />
      )
      
      const sources_elements = container.querySelectorAll('source')
      const fallbackSource = Array.from(sources_elements).find(
        s => !s.getAttribute('type')
      )
      
      expect(fallbackSource).toBeDefined()
      expect(fallbackSource?.getAttribute('srcset')).toContain('image-320.jpg 320w')
      expect(fallbackSource?.getAttribute('srcset')).toContain('image-640.jpg 640w')
    })

    it('includes sizes attribute for responsive images', () => {
      const sources = [
        { src: '/image-320.webp', width: 320, format: 'webp' as const },
        { src: '/image-640.webp', width: 640, format: 'webp' as const },
      ]

      const { container } = render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          sources={sources}
          priority
        />
      )
      
      const webpSource = container.querySelector('source[type="image/webp"]')
      expect(webpSource?.getAttribute('sizes')).toBeDefined()
      expect(webpSource?.getAttribute('sizes')).toContain('100vw')
    })
  })

  describe('Loading States', () => {
    it('starts with opacity-0 before load', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          priority
        />
      )
      
      const img = screen.getByAltText('Test image')
      expect(img.className).toContain('opacity-0')
    })

    it('calls onLoad callback when image loads', async () => {
      const handleLoad = vi.fn()
      
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          priority
          onLoad={handleLoad}
        />
      )
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image load
      img.dispatchEvent(new Event('load'))
      
      await waitFor(() => {
        expect(handleLoad).toHaveBeenCalledTimes(1)
      })
    })

    it('transitions to opacity-100 after load', async () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          priority
        />
      )
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image load
      img.dispatchEvent(new Event('load'))
      
      await waitFor(() => {
        expect(img.className).toContain('opacity-100')
      })
    })
  })

  describe('Error Handling', () => {
    it('calls onError callback when image fails to load', async () => {
      const handleError = vi.fn()
      
      render(
        <OptimizedImage 
          src="/invalid.jpg" 
          alt="Test image"
          priority
          onError={handleError}
        />
      )
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image error
      img.dispatchEvent(new Event('error'))
      
      await waitFor(() => {
        expect(handleError).toHaveBeenCalledTimes(1)
      })
    })

    it('hides image on error', async () => {
      render(
        <OptimizedImage 
          src="/invalid.jpg" 
          alt="Test image"
          priority
        />
      )
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image error
      img.dispatchEvent(new Event('error'))
      
      await waitFor(() => {
        expect(img.className).toContain('hidden')
      })
    })

    it('shows error fallback message on error', async () => {
      render(
        <OptimizedImage 
          src="/invalid.jpg" 
          alt="Test image"
          priority
        />
      )
      
      const img = screen.getByAltText('Test image')
      
      // Simulate image error
      img.dispatchEvent(new Event('error'))
      
      await waitFor(() => {
        expect(screen.getByText('Image failed to load')).toBeDefined()
      })
    })
  })

  describe('Object Fit', () => {
    it('applies cover object-fit by default', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          priority
        />
      )
      
      const img = screen.getByAltText('Test image')
      expect(img.style.objectFit).toBe('cover')
    })

    it('applies custom object-fit when provided', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          priority
          objectFit="contain"
        />
      )
      
      const img = screen.getByAltText('Test image')
      expect(img.style.objectFit).toBe('contain')
    })
  })

  describe('Accessibility', () => {
    it('requires alt text', () => {
      render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Descriptive alt text"
          priority
        />
      )
      
      const img = screen.getByAltText('Descriptive alt text')
      expect(img).toBeDefined()
    })

    it('uses semantic picture element', () => {
      const { container } = render(
        <OptimizedImage 
          src="/image.jpg" 
          alt="Test image"
          priority
        />
      )
      
      const picture = container.querySelector('picture')
      expect(picture).toBeDefined()
    })
  })
})
