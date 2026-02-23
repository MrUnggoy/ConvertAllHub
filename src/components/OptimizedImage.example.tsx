import OptimizedImage from './OptimizedImage'
import { generateImageSources, getStandardImageSizes } from '@/utils/image-optimization'

/**
 * OptimizedImage Component Examples
 * 
 * Demonstrates various usage patterns for the OptimizedImage component
 */

export default function OptimizedImageExamples() {
  // Example 1: Simple image with lazy loading
  const SimpleImage = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Simple Image (Lazy Loading)</h3>
      <OptimizedImage
        src="/images/example.jpg"
        alt="Example image"
        className="rounded-lg shadow-lg"
      />
    </div>
  )

  // Example 2: Priority image for LCP optimization
  const PriorityImage = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Priority Image (Eager Loading)</h3>
      <OptimizedImage
        src="/images/hero.jpg"
        alt="Hero image"
        priority
        className="w-full h-[400px] rounded-lg shadow-lg"
        objectFit="cover"
      />
    </div>
  )

  // Example 3: Responsive image with multiple sources
  const ResponsiveImage = () => {
    const sources = generateImageSources({
      basePath: '/images',
      baseFilename: 'hero',
      extension: 'jpg',
      sizes: getStandardImageSizes(),
      formats: ['webp', 'jpg']
    })

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Responsive Image with srcset</h3>
        <OptimizedImage
          src="/images/hero.jpg"
          alt="Responsive hero image"
          sources={sources}
          priority
          className="w-full h-[500px] rounded-lg shadow-lg"
          objectFit="cover"
        />
      </div>
    )
  }

  // Example 4: Fixed size thumbnail
  const ThumbnailImage = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Fixed Size Thumbnail</h3>
      <OptimizedImage
        src="/images/thumbnail.jpg"
        alt="Thumbnail"
        width={200}
        height={200}
        className="rounded-lg shadow-md"
        objectFit="cover"
      />
    </div>
  )

  // Example 5: Image with callbacks
  const ImageWithCallbacks = () => {
    const handleLoad = () => {
      console.log('Image loaded successfully')
    }

    const handleError = () => {
      console.error('Image failed to load')
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Image with Callbacks</h3>
        <OptimizedImage
          src="/images/example.jpg"
          alt="Example with callbacks"
          onLoad={handleLoad}
          onError={handleError}
          className="rounded-lg shadow-lg"
        />
      </div>
    )
  }

  // Example 6: Gallery with lazy loading
  const ImageGallery = () => {
    const images = [
      { id: 1, src: '/images/gallery-1.jpg', alt: 'Gallery image 1' },
      { id: 2, src: '/images/gallery-2.jpg', alt: 'Gallery image 2' },
      { id: 3, src: '/images/gallery-3.jpg', alt: 'Gallery image 3' },
      { id: 4, src: '/images/gallery-4.jpg', alt: 'Gallery image 4' },
      { id: 5, src: '/images/gallery-5.jpg', alt: 'Gallery image 5' },
      { id: 6, src: '/images/gallery-6.jpg', alt: 'Gallery image 6' },
    ]

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Image Gallery (Lazy Loading)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <OptimizedImage
              key={image.id}
              src={image.src}
              alt={image.alt}
              width={300}
              height={300}
              className="rounded-lg shadow-md"
              objectFit="cover"
            />
          ))}
        </div>
      </div>
    )
  }

  // Example 7: Hero section with background image
  const HeroWithBackgroundImage = () => {
    const heroSources = [
      { src: '/images/hero-320.webp', width: 320, format: 'webp' as const },
      { src: '/images/hero-640.webp', width: 640, format: 'webp' as const },
      { src: '/images/hero-1024.webp', width: 1024, format: 'webp' as const },
      { src: '/images/hero-1920.webp', width: 1920, format: 'webp' as const },
    ]

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hero Section with Background Image</h3>
        <div className="relative rounded-lg overflow-hidden">
          <OptimizedImage
            src="/images/hero.jpg"
            alt="Hero background"
            sources={heroSources}
            priority
            className="w-full h-[600px]"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Welcome to ConvertAll Hub</h1>
              <p className="text-xl">Free online file conversion tools</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Example 8: Different object-fit values
  const ObjectFitExamples = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Object-Fit Examples</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm mb-2">Cover (default)</p>
          <OptimizedImage
            src="/images/example.jpg"
            alt="Cover"
            width={200}
            height={200}
            objectFit="cover"
            className="rounded-lg border"
          />
        </div>
        <div>
          <p className="text-sm mb-2">Contain</p>
          <OptimizedImage
            src="/images/example.jpg"
            alt="Contain"
            width={200}
            height={200}
            objectFit="contain"
            className="rounded-lg border bg-gray-100"
          />
        </div>
        <div>
          <p className="text-sm mb-2">Fill</p>
          <OptimizedImage
            src="/images/example.jpg"
            alt="Fill"
            width={200}
            height={200}
            objectFit="fill"
            className="rounded-lg border"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">OptimizedImage Component Examples</h1>
        <p className="text-gray-600">
          Demonstrates image optimization with WebP support, responsive images, and lazy loading
        </p>
      </div>

      <SimpleImage />
      <PriorityImage />
      <ResponsiveImage />
      <ThumbnailImage />
      <ImageWithCallbacks />
      <ImageGallery />
      <HeroWithBackgroundImage />
      <ObjectFitExamples />

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Performance Notes</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Priority images load eagerly to optimize Largest Contentful Paint (LCP)</li>
          <li>Non-priority images use lazy loading with Intersection Observer</li>
          <li>WebP format reduces file size by 25-35% compared to JPEG</li>
          <li>Responsive images with srcset deliver optimal size for each viewport</li>
          <li>Loading placeholders prevent layout shift during image load</li>
        </ul>
      </div>
    </div>
  )
}
