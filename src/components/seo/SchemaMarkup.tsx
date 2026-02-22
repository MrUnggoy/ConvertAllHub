import { useEffect } from 'react'

export type SchemaType = 'WebApplication' | 'SoftwareApplication' | 'ItemList'

export interface SchemaMarkupProps {
  type: SchemaType
  data: Record<string, any>
}

/**
 * SchemaMarkup component for managing JSON-LD structured data
 * Supports WebApplication, SoftwareApplication, and ItemList schema types
 * 
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 */
export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  useEffect(() => {
    // Create the structured data object with @context and @type
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    }

    // Find or create the script tag for structured data
    let scriptTag = document.querySelector('script[type="application/ld+json"]')
    
    if (!scriptTag) {
      scriptTag = document.createElement('script')
      scriptTag.setAttribute('type', 'application/ld+json')
      document.head.appendChild(scriptTag)
    }
    
    // Set the JSON-LD content
    scriptTag.textContent = JSON.stringify(structuredData, null, 2)

    // Cleanup function to remove the script tag when component unmounts
    return () => {
      // We keep the script tag as it should be replaced by the next page's schema
    }
  }, [type, data])

  return null // This component doesn't render anything
}

/**
 * Helper function to create WebApplication schema data for homepage
 * Validates: Requirements 12.1, 12.5, 12.6, 12.7
 */
export function createWebApplicationSchema(
  name: string,
  description: string,
  url: string
): Record<string, any> {
  return {
    name,
    description,
    url,
    applicationCategory: 'UtilitiesApplication', // Requirement 12.5
    operatingSystem: 'Any (Web-based)', // Requirement 12.7
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }, // Requirement 12.6
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0'
  }
}

/**
 * Helper function to create SoftwareApplication schema data for tool pages
 * Validates: Requirements 12.3, 12.4, 12.5, 12.6, 12.7
 */
export function createSoftwareApplicationSchema(
  name: string,
  description: string,
  url: string,
  category: string,
  inputFormats: string[],
  outputFormats: string[]
): Record<string, any> {
  return {
    name,
    description,
    url,
    applicationCategory: 'UtilitiesApplication', // Requirement 12.5
    operatingSystem: 'Any (Web-based)', // Requirement 12.7
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }, // Requirement 12.6
    category, // Requirement 12.4
    featureList: [
      `Supports ${inputFormats.join(', ')} input formats`,
      `Converts to ${outputFormats.join(', ')} output formats`,
      'Client-side processing for privacy',
      'No file upload required',
      'Free to use'
    ], // Requirement 12.4
    browserRequirements: 'Requires JavaScript. Requires HTML5.'
  }
}

/**
 * Helper function to create ItemList schema data for tool listings
 * Validates: Requirements 12.2
 */
export function createItemListSchema(
  items: Array<{
    name: string
    description: string
    url: string
  }>
): Record<string, any> {
  return {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: item.name,
        description: item.description,
        url: item.url
      }
    }))
  }
}
