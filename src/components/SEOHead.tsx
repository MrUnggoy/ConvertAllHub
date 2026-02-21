import { useEffect } from 'react'
import { SEOData } from '@/utils/seo'

interface SEOHeadProps {
  seoData: SEOData
}

export default function SEOHead({ seoData }: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = seoData.title

    // Update or create meta tags
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

    // Basic meta tags
    updateMetaTag('description', seoData.description)
    updateMetaTag('keywords', seoData.keywords.join(', '))
    
    // Open Graph tags
    updateMetaTag('og:title', seoData.title, true)
    updateMetaTag('og:description', seoData.description, true)
    updateMetaTag('og:type', 'website', true)
    updateMetaTag('og:site_name', 'ConvertAll Hub', true)
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', seoData.title)
    updateMetaTag('twitter:description', seoData.description)
    
    // Canonical URL
    if (seoData.canonicalUrl) {
      updateMetaTag('og:url', seoData.canonicalUrl, true)
      
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', seoData.canonicalUrl)
    }

    // Structured data
    if (seoData.structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]')
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script')
        structuredDataScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(structuredDataScript)
      }
      structuredDataScript.textContent = JSON.stringify(seoData.structuredData)
    }

    // Cleanup function to remove dynamic meta tags when component unmounts
    return () => {
      // We don't remove meta tags on unmount as they should persist
      // until the next page loads with new SEO data
    }
  }, [seoData])

  return null // This component doesn't render anything
}