# OptimizedImage Component

## Overview

The `OptimizedImage` component provides automatic image optimization with WebP format support, responsive images using srcset, lazy loading for below-fold images, and optimization for Largest Contentful Paint (LCP).

**Validates:** Requirement 9.4 - Image optimization for performance

## Features

- **WebP Support with Fallbacks**: Automatically serves WebP images to modern browsers with fallback to original format
- **Responsive Images**: Uses srcset and sizes attributes for optimal image delivery based on viewport
- **Lazy Loading**: Implements Intersection Observer for lazy loading below-fold images
- **LCP Optimization**: Priority images load eagerly to optimize Largest Contentful Paint
- **Loading States**: Shows placeholder during loading and error fallback on failure
- **Accessibility**: Proper alt text support and semantic HTML

## Usage

### Basic Usage

```tsx
import OptimizedImage from '@/components/OptimizedImage'

// Simple image with lazy loading
<OptimizedImage 
  src="/images/hero.jpg" 
  alt="Hero image" 
/>
```

### Priority Image (for LCP)

```tsx
// Hero images should use priority to load eagerly
<OptimizedImage 
  src="/images/hero.jpg" 
  alt="Hero image"
  priority
/>
```

### Responsive Images with srcset

```tsx
import { generateImageSources } from '@/utils/image-optimization'

const heroSources = generateImageSources({
  basePath: '/images',
  baseFilename: 'hero',
  extension: 'jpg',
  sizes: [320, 640, 1024, 1920],
  formats: ['webp', 'jpg']
})

<OptimizedImage 
  src="/images/hero.jpg" 
  alt="Hero image"
  sources={heroSources}
  priority
/>
```

### With Custom Dimensions

```tsx
<OptimizedImage 
  src="/images/thumbnail.jpg" 
  alt="Thumbnail"
  width={200}
  height={200}
  objectFit="cover"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | Required | Image source URL (fallback) |
| `alt` | `string` | Required | Alternative text for accessibility |
| `width` | `number` | Optional | Image width in pixels |
| `height` | `number` | Optional | Image height in pixels |
| `sources` | `ImageSource[]` | `[]` | Array of responsive image sources |
| `priority` | `boolean` | `false` | If true, loads eagerly (for LCP images) |
| `className` | `string` | Optional | Additional CSS classes |
| `objectFit` | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | CSS object-fit value |
| `onLoad` | `() => void` | Optional | Callback when image loads |
| `onError` | `() => void` | Optional | Callback when image fails to load |

## ImageSource Interface

```typescript
interface ImageSource {
  src: string
  width: number
  format?: 'webp' | 'jpg' | 'png'
}
```

## Image Optimization Utilities

The `image-optimization.ts` utility file provides helper functions:

### generateImageSources

Generate responsive image sources with WebP support:

```typescript
import { generateImageSources } from '@/utils/image-optimization'

const sources = generateImageSources({
  basePath: '/images',
  baseFilename: 'hero',
  extension: 'jpg',
  sizes: [320, 640, 1024, 1920],
  formats: ['webp', 'jpg']
})
```

### getStandardImageSizes

Get standard responsive breakpoint sizes:

```typescript
import { getStandardImageSizes } from '@/utils/image-optimization'

const sizes = getStandardImageSizes() // [320, 640, 1024, 1280, 1920]
```

### preloadImage

Preload critical images for LCP optimization:

```typescript
import { preloadImage } from '@/utils/image-optimization'

preloadImage(
  '/hero.webp',
  '/hero-320.webp 320w, /hero-640.webp 640w',
  'image/webp'
)
```

## Best Practices

### 1. Use Priority for Above-the-Fold Images

Hero images and other above-the-fold images should use `priority={true}` to load eagerly and optimize LCP:

```tsx
<OptimizedImage 
  src="/hero.jpg" 
  alt="Hero" 
  priority 
/>
```

### 2. Provide Responsive Sources

For large images, provide multiple sizes for different viewports:

```tsx
const sources = [
  { src: '/hero-320.webp', width: 320, format: 'webp' },
  { src: '/hero-640.webp', width: 640, format: 'webp' },
  { src: '/hero-1024.webp', width: 1024, format: 'webp' },
  { src: '/hero-1920.webp', width: 1920, format: 'webp' },
]

<OptimizedImage src="/hero.jpg" alt="Hero" sources={sources} priority />
```

### 3. Use Lazy Loading for Below-the-Fold Images

Images below the fold should not use priority (default behavior):

```tsx
<OptimizedImage 
  src="/feature.jpg" 
  alt="Feature" 
  // priority={false} is default
/>
```

### 4. Specify Dimensions When Known

Providing width and height prevents layout shift:

```tsx
<OptimizedImage 
  src="/thumbnail.jpg" 
  alt="Thumbnail"
  width={200}
  height={200}
/>
```

## Image Preparation Guide

### 1. Generate WebP Versions

Use tools like `cwebp` or online converters to create WebP versions:

```bash
# Using cwebp CLI
cwebp -q 80 hero.jpg -o hero.webp
```

### 2. Create Responsive Sizes

Generate multiple sizes for responsive images:

```bash
# Using ImageMagick
convert hero.jpg -resize 320x hero-320.jpg
convert hero.jpg -resize 640x hero-640.jpg
convert hero.jpg -resize 1024x hero-1024.jpg
convert hero.jpg -resize 1920x hero-1920.jpg

# Convert to WebP
cwebp -q 80 hero-320.jpg -o hero-320.webp
cwebp -q 80 hero-640.jpg -o hero-640.webp
cwebp -q 80 hero-1024.jpg -o hero-1024.webp
cwebp -q 80 hero-1920.jpg -o hero-1920.webp
```

### 3. Optimize File Sizes

- Use quality 80-85 for WebP (good balance of quality and size)
- Use quality 85-90 for JPEG fallbacks
- Compress PNG files with tools like `pngquant`

## Performance Impact

### Before Optimization
- Large JPEG files (500KB+)
- No responsive images
- All images load immediately
- Poor LCP scores

### After Optimization
- WebP reduces file size by 25-35%
- Responsive images save bandwidth on mobile
- Lazy loading reduces initial page load
- Priority images optimize LCP

## Browser Support

- **WebP**: Chrome, Edge, Firefox, Safari 14+
- **Lazy Loading**: All modern browsers (native `loading="lazy"`)
- **Intersection Observer**: All modern browsers (polyfill available)

## Accessibility

The component ensures accessibility by:
- Requiring `alt` text for all images
- Using semantic `<picture>` element
- Providing loading state announcements
- Supporting keyboard navigation

## Examples

### Hero Section with Background Image

```tsx
import OptimizedImage from '@/components/OptimizedImage'
import { generateImageSources } from '@/utils/image-optimization'

const heroSources = generateImageSources({
  basePath: '/images',
  baseFilename: 'hero',
  extension: 'jpg',
  sizes: [320, 640, 1024, 1920],
  formats: ['webp', 'jpg']
})

<div className="relative">
  <OptimizedImage
    src="/images/hero.jpg"
    alt="Hero background"
    sources={heroSources}
    priority
    className="w-full h-[600px]"
    objectFit="cover"
  />
  <div className="absolute inset-0 flex items-center justify-center">
    <h1>Welcome</h1>
  </div>
</div>
```

### Tool Card with Thumbnail

```tsx
<OptimizedImage
  src="/images/tool-thumbnail.jpg"
  alt="PDF Converter Tool"
  width={300}
  height={200}
  className="rounded-lg"
  objectFit="cover"
/>
```

### Gallery with Lazy Loading

```tsx
<div className="grid grid-cols-3 gap-4">
  {images.map((image) => (
    <OptimizedImage
      key={image.id}
      src={image.src}
      alt={image.alt}
      width={300}
      height={300}
      // Lazy loading is default for below-fold images
    />
  ))}
</div>
```
