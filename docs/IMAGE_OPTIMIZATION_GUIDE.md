# Image Optimization Guide

## Overview

This guide explains how to optimize images for performance in ConvertAll Hub, focusing on improving Largest Contentful Paint (LCP) and overall page load times.

**Validates:** Requirement 9.4 - Image optimization for performance

## Key Concepts

### 1. WebP Format

WebP is a modern image format that provides superior compression compared to JPEG and PNG:
- **25-35% smaller** file sizes than JPEG at equivalent quality
- Supports both lossy and lossless compression
- Supports transparency (like PNG)
- Supported by all modern browsers (Chrome, Edge, Firefox, Safari 14+)

### 2. Responsive Images

Responsive images deliver different image sizes based on the user's viewport:
- Reduces bandwidth usage on mobile devices
- Improves load times on slower connections
- Uses `srcset` and `sizes` attributes for automatic selection

### 3. Lazy Loading

Lazy loading defers loading of below-the-fold images:
- Reduces initial page load time
- Saves bandwidth for images users never see
- Uses Intersection Observer API for efficient detection

### 4. Priority Loading (LCP Optimization)

Priority loading ensures critical above-the-fold images load immediately:
- Optimizes Largest Contentful Paint (LCP) metric
- Uses `loading="eager"` and `decoding="sync"`
- Should be used for hero images and other critical visuals

## Implementation

### Using OptimizedImage Component

The `OptimizedImage` component handles all optimization automatically:

```tsx
import OptimizedImage from '@/components/OptimizedImage'

// Basic usage with lazy loading
<OptimizedImage 
  src="/images/feature.jpg" 
  alt="Feature description" 
/>

// Priority image for hero section (LCP optimization)
<OptimizedImage 
  src="/images/hero.jpg" 
  alt="Hero image"
  priority
/>
```

### Generating Responsive Image Sources

Use the `generateImageSources` utility to create responsive image configurations:

```tsx
import { generateImageSources, getStandardImageSizes } from '@/utils/image-optimization'

const heroSources = generateImageSources({
  basePath: '/images',
  baseFilename: 'hero',
  extension: 'jpg',
  sizes: getStandardImageSizes(), // [320, 640, 1024, 1280, 1920]
  formats: ['webp', 'jpg']
})

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero image"
  sources={heroSources}
  priority
/>
```

### Using in HeroSection

The HeroSection component supports optimized background images:

```tsx
import HeroSection from '@/components/HeroSection'
import { generateImageSources } from '@/utils/image-optimization'

const heroBackgroundSources = generateImageSources({
  basePath: '/images',
  baseFilename: 'hero-background',
  extension: 'jpg',
  sizes: [640, 1024, 1920],
  formats: ['webp', 'jpg']
})

<HeroSection
  title="ConvertAll Hub"
  valueProposition={{
    what: "Free online file conversion tools",
    who: "for everyone",
    why: "Fast, secure, and privacy-first"
  }}
  primaryCTA={{
    text: "Start Converting Now",
    action: handleCTAClick,
    ariaLabel: "Start converting files"
  }}
  backgroundImage={{
    src: '/images/hero-background.jpg',
    alt: 'Hero background',
    sources: heroBackgroundSources,
    opacity: 0.7
  }}
/>
```

## Image Preparation Workflow

### Step 1: Create Original High-Quality Image

Start with a high-quality source image:
- Use the highest resolution available
- Prefer lossless formats (PNG, TIFF) for source
- Recommended: 2x the largest display size

### Step 2: Generate Responsive Sizes

Create multiple sizes for different viewports:

```bash
# Using ImageMagick
convert hero.jpg -resize 320x hero-320.jpg
convert hero.jpg -resize 640x hero-640.jpg
convert hero.jpg -resize 1024x hero-1024.jpg
convert hero.jpg -resize 1280x hero-1280.jpg
convert hero.jpg -resize 1920x hero-1920.jpg
```

**Standard Breakpoints:**
- 320px: Mobile portrait
- 640px: Mobile landscape / Small tablet
- 1024px: Tablet / Small desktop
- 1280px: Desktop
- 1920px: Large desktop / HD displays

### Step 3: Convert to WebP

Convert all sizes to WebP format:

```bash
# Using cwebp CLI tool
cwebp -q 80 hero-320.jpg -o hero-320.webp
cwebp -q 80 hero-640.jpg -o hero-640.webp
cwebp -q 80 hero-1024.jpg -o hero-1024.webp
cwebp -q 80 hero-1280.jpg -o hero-1280.webp
cwebp -q 80 hero-1920.jpg -o hero-1920.webp
```

**Quality Settings:**
- `-q 80`: Good balance for photos (recommended)
- `-q 85`: Higher quality for important images
- `-q 75`: More compression for less critical images

### Step 4: Optimize JPEG Fallbacks

Optimize JPEG files for browsers that don't support WebP:

```bash
# Using ImageMagick
convert hero-320.jpg -quality 85 -strip hero-320.jpg
convert hero-640.jpg -quality 85 -strip hero-640.jpg
convert hero-1024.jpg -quality 85 -strip hero-1024.jpg
convert hero-1280.jpg -quality 85 -strip hero-1280.jpg
convert hero-1920.jpg -quality 85 -strip hero-1920.jpg
```

The `-strip` flag removes metadata to reduce file size.

### Step 5: Organize Files

Place optimized images in the public directory:

```
public/
  images/
    hero-320.webp
    hero-320.jpg
    hero-640.webp
    hero-640.jpg
    hero-1024.webp
    hero-1024.jpg
    hero-1280.webp
    hero-1280.jpg
    hero-1920.webp
    hero-1920.jpg
```

## Automated Image Optimization

### Using Build Tools

For automated optimization during build, consider these tools:

#### 1. vite-plugin-imagemin

```bash
npm install vite-plugin-imagemin --save-dev
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 85 },
      webp: { quality: 80 }
    })
  ]
}
```

#### 2. Sharp (Node.js)

Create a script to generate responsive images:

```javascript
// scripts/optimize-images.js
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [320, 640, 1024, 1280, 1920]
const inputDir = 'src/assets/images'
const outputDir = 'public/images'

async function optimizeImage(inputPath, filename) {
  const name = path.parse(filename).name
  
  for (const size of sizes) {
    // Generate WebP
    await sharp(inputPath)
      .resize(size)
      .webp({ quality: 80 })
      .toFile(path.join(outputDir, `${name}-${size}.webp`))
    
    // Generate JPEG fallback
    await sharp(inputPath)
      .resize(size)
      .jpeg({ quality: 85 })
      .toFile(path.join(outputDir, `${name}-${size}.jpg`))
  }
}

// Process all images in input directory
fs.readdirSync(inputDir).forEach(file => {
  if (/\.(jpg|jpeg|png)$/i.test(file)) {
    optimizeImage(path.join(inputDir, file), file)
  }
})
```

Run the script:

```bash
node scripts/optimize-images.js
```

## Performance Best Practices

### 1. Prioritize Above-the-Fold Images

Always use `priority={true}` for images visible on initial page load:

```tsx
// ✅ Good: Hero image with priority
<OptimizedImage 
  src="/hero.jpg" 
  alt="Hero" 
  priority 
/>

// ❌ Bad: Hero image without priority
<OptimizedImage 
  src="/hero.jpg" 
  alt="Hero" 
/>
```

### 2. Use Lazy Loading for Below-the-Fold Images

Let non-critical images load lazily (default behavior):

```tsx
// ✅ Good: Gallery images load lazily
<OptimizedImage 
  src="/gallery-1.jpg" 
  alt="Gallery image" 
/>
```

### 3. Provide Dimensions to Prevent Layout Shift

Specify width and height to reserve space:

```tsx
// ✅ Good: Dimensions prevent layout shift
<OptimizedImage 
  src="/thumbnail.jpg" 
  alt="Thumbnail"
  width={200}
  height={200}
/>

// ❌ Bad: No dimensions causes layout shift
<OptimizedImage 
  src="/thumbnail.jpg" 
  alt="Thumbnail"
/>
```

### 4. Use Appropriate Image Sizes

Don't serve oversized images:

```tsx
// ❌ Bad: Serving 4K image for 200px thumbnail
<OptimizedImage 
  src="/hero-3840.jpg" 
  alt="Thumbnail"
  width={200}
  height={200}
/>

// ✅ Good: Appropriate size for thumbnail
<OptimizedImage 
  src="/thumbnail-200.jpg" 
  alt="Thumbnail"
  width={200}
  height={200}
/>
```

### 5. Preload Critical Images

For the most critical images (like hero backgrounds), consider preloading:

```tsx
import { preloadImage } from '@/utils/image-optimization'

// In component or page initialization
useEffect(() => {
  preloadImage(
    '/images/hero.webp',
    '/images/hero-320.webp 320w, /images/hero-640.webp 640w',
    'image/webp'
  )
}, [])
```

## Measuring Performance Impact

### Core Web Vitals

Monitor these metrics to measure image optimization impact:

#### Largest Contentful Paint (LCP)
- **Target:** < 2.5 seconds
- **Impact:** Priority loading of hero images
- **Tool:** Lighthouse, PageSpeed Insights

#### Cumulative Layout Shift (CLS)
- **Target:** < 0.1
- **Impact:** Specifying image dimensions
- **Tool:** Lighthouse, Chrome DevTools

#### First Contentful Paint (FCP)
- **Target:** < 1.5 seconds
- **Impact:** Lazy loading below-fold images
- **Tool:** Lighthouse, WebPageTest

### Testing Tools

1. **Lighthouse (Chrome DevTools)**
   - Open DevTools → Lighthouse tab
   - Run audit for Performance
   - Check "Properly size images" and "Serve images in next-gen formats"

2. **PageSpeed Insights**
   - Visit https://pagespeed.web.dev/
   - Enter your URL
   - Review image optimization opportunities

3. **WebPageTest**
   - Visit https://www.webpagetest.org/
   - Test with different connection speeds
   - Review filmstrip view to see image loading

## Troubleshooting

### Images Not Loading

**Problem:** Images don't appear on the page

**Solutions:**
1. Check file paths are correct
2. Verify images exist in public directory
3. Check browser console for 404 errors
4. Ensure alt text is provided (required prop)

### WebP Not Working

**Problem:** WebP images not being served

**Solutions:**
1. Verify WebP files exist
2. Check browser support (Safari < 14 doesn't support WebP)
3. Ensure fallback JPEG/PNG sources are provided
4. Check Content-Type headers in network tab

### Lazy Loading Not Working

**Problem:** All images load immediately

**Solutions:**
1. Verify `priority={false}` or omit priority prop
2. Check IntersectionObserver browser support
3. Ensure images are below the fold
4. Check console for JavaScript errors

### Poor LCP Score

**Problem:** Largest Contentful Paint is slow

**Solutions:**
1. Use `priority={true}` for hero images
2. Reduce hero image file size
3. Preload critical images
4. Optimize server response time
5. Use CDN for image delivery

## File Size Guidelines

### Target File Sizes

| Image Type | Dimensions | WebP Size | JPEG Size |
|------------|------------|-----------|-----------|
| Hero (mobile) | 640x400 | 20-40 KB | 30-60 KB |
| Hero (desktop) | 1920x1080 | 80-120 KB | 120-180 KB |
| Thumbnail | 200x200 | 5-10 KB | 8-15 KB |
| Feature image | 800x600 | 30-50 KB | 45-75 KB |
| Gallery image | 400x300 | 10-20 KB | 15-30 KB |

### Compression Quality Guidelines

| Use Case | WebP Quality | JPEG Quality |
|----------|--------------|--------------|
| Hero images | 80-85 | 85-90 |
| Feature images | 75-80 | 80-85 |
| Thumbnails | 70-75 | 75-80 |
| Background images | 70-75 | 75-80 |
| Icons/logos | 85-90 | 90-95 |

## Browser Support

### WebP Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 23+ | ✅ Full |
| Edge | 18+ | ✅ Full |
| Firefox | 65+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Safari | < 14 | ❌ Use fallback |
| IE 11 | All | ❌ Use fallback |

### Lazy Loading Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 77+ | ✅ Native |
| Edge | 79+ | ✅ Native |
| Firefox | 75+ | ✅ Native |
| Safari | 15.4+ | ✅ Native |
| All modern | - | ✅ Polyfill |

## Additional Resources

### Tools

- **cwebp**: WebP encoder CLI tool
  - Download: https://developers.google.com/speed/webp/download
  
- **ImageMagick**: Image manipulation tool
  - Download: https://imagemagick.org/script/download.php
  
- **Sharp**: High-performance Node.js image processing
  - NPM: https://www.npmjs.com/package/sharp

### Documentation

- **WebP Format**: https://developers.google.com/speed/webp
- **Responsive Images**: https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
- **Lazy Loading**: https://web.dev/lazy-loading-images/
- **LCP Optimization**: https://web.dev/optimize-lcp/

### Testing

- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/

## Summary

Image optimization is critical for performance:

1. **Use WebP format** with JPEG/PNG fallbacks (25-35% size reduction)
2. **Implement responsive images** with srcset for different viewports
3. **Enable lazy loading** for below-the-fold images
4. **Prioritize hero images** for optimal LCP scores
5. **Specify dimensions** to prevent layout shift
6. **Monitor Core Web Vitals** to measure impact

The `OptimizedImage` component and utilities handle these optimizations automatically, making it easy to deliver fast, efficient images throughout the application.
