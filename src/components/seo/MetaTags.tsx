import { useEffect } from 'react'

export interface MetaTagsProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
  type?: 'website' | 'article'
}

/**
 * MetaTags component for managing SEO meta tags
 * Handles standard meta tags, Open Graph tags, Twitter Card tags, and canonical URLs
 * 
 * Validates: Requirements 11.1, 11.2, 11.3, 11.5, 11.7, 11.8
 */
export default function MetaTags({
  title,
  description,
  keywords = [],
  ogImage,
  canonicalUrl,
  type = 'website'
}: MetaTagsProps) {
  useEffect(() => {
    // Update document title
    document.title = title

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement
      
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    }

    // Standard meta tags
    updateMetaTag('description', description)
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '))
    }
    
    // Viewport meta tag for mobile responsiveness (Requirement 11.7)
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    
    // Open Graph meta tags (Requirement 11.2)
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:site_name', 'ConvertAll Hub', true)
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true)
    }
    
    if (canonicalUrl) {
      updateMetaTag('og:url', canonicalUrl, true)
    }
    
    // Twitter Card meta tags (Requirement 11.3)
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage)
    }
    
    // Canonical URL (Requirement 11.5)
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', canonicalUrl)
    }
  }, [title, description, keywords, ogImage, canonicalUrl, type])

  return null // This component doesn't render anything
}
