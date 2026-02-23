import { toolRegistry } from '@/tools/registry'
import HeroSection from '@/components/HeroSection'
import TrustBadges from '@/components/TrustBadges'
import ToolLibrary from '@/components/ToolLibrary'
import BusinessPromotion from '@/components/business/BusinessPromotion'
import AdZone from '@/components/business/AdZone'
import MetaTags from '@/components/seo/MetaTags'
import SchemaMarkup, { createWebApplicationSchema, createItemListSchema } from '@/components/seo/SchemaMarkup'

export default function HomePage() {
  const tools = toolRegistry.getAllTools()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://convertall.hub'
  
  // Sample business promotion config
  const businessPromoConfig = {
    id: 'main-promo',
    enabled: true,
    title: 'Need Custom Development?',
    description: 'Professional web development services for your business needs.',
    linkUrl: '#',
    linkText: 'Learn More',
    position: 'inline' as const
  }

  // Sample ad zone config
  const adZoneConfig = {
    id: 'top-ad',
    enabled: false,
    type: 'promotion' as const,
    content: {},
    label: 'Sponsored',
    position: 'top' as const
  }
  
  // SEO data for homepage
  const seoTitle = 'ConvertAll Hub - Free Online File Conversion Tools'
  const seoDescription = `Convert files online for free with ${tools.length}+ powerful conversion tools. PDF, Image, Audio, Video, Text, OCR, and QR code tools. Fast, secure, and privacy-focused.`
  const seoKeywords = [
    'file converter',
    'online converter',
    'free conversion',
    'pdf converter',
    'image converter',
    'audio converter',
    'video converter',
    'text tools',
    'ocr',
    'qr code generator'
  ]

  // Schema markup data
  const webAppSchema = createWebApplicationSchema(
    'ConvertAll Hub',
    seoDescription,
    baseUrl
  )

  const itemListSchema = createItemListSchema(
    tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      url: `${baseUrl}/tool/${tool.id}`
    }))
  )

  // Combine schemas for homepage
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', ...webAppSchema },
      { '@type': 'ItemList', ...itemListSchema }
    ]
  }

  return (
    <div className="relative">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)'
        }}
        aria-hidden="true"
      />

      <div className="space-y-16 pb-16">
        {/* SEO Meta Tags */}
        <MetaTags
          title={seoTitle}
          description={seoDescription}
          keywords={seoKeywords}
          canonicalUrl={baseUrl}
          type="website"
        />

        {/* Schema Markup */}
        <SchemaMarkup type="WebApplication" data={combinedSchema} />

        {/* Hero Section - Enhanced with value proposition and prominent CTA */}
        <section aria-label="Welcome and introduction" className="animate-fade-in">
          <HeroSection 
            title="ConvertAll Hub"
            valueProposition={{
              what: "Free online file conversion tools",
              who: "for everyone",
              why: "Fast, secure, and privacy-first"
            }}
            primaryCTA={{
              text: "Start Converting Now",
              action: () => {
                // Scroll to tools section
                const toolsSection = document.querySelector('[role="list"]')
                if (toolsSection) {
                  toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              },
              ariaLabel: "Scroll to conversion tools"
            }}
          />
        </section>

        {/* Trust Badges - Enhanced with metrics and tooltips */}
        <section aria-label="Trust and security features" className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <TrustBadges 
            layout="horizontal"
            showMetrics={true}
          />
        </section>

        {/* Ad Zone (top) */}
        {adZoneConfig.enabled && <AdZone config={adZoneConfig} />}

        {/* Tool Library with Category Filter and Search */}
        <section aria-label="Available conversion tools" className="animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <ToolLibrary tools={tools} />
        </section>

        {/* Business Promotion */}
        <section aria-label="Business services" className="animate-fade-in">
          <BusinessPromotion config={businessPromoConfig} />
        </section>

        {/* Premium Footer */}
        <footer className="relative mt-24">
          {/* Gradient divider */}
          <div 
            className="h-px w-full mb-12"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)'
            }}
            aria-hidden="true"
          />
          
          <div className="text-center space-y-8">
            {/* Footer content with glassmorphism */}
            <div className="inline-block px-8 py-6 rounded-2xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-premium">
              <p className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Built with ❤️ for privacy-conscious users
              </p>
            </div>
            
            {/* Footer links */}
            <nav aria-label="Footer navigation">
              <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 text-base">
                <a 
                  href="/privacy" 
                  className="relative group text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px] flex items-center justify-center font-medium transition-colors duration-300"
                >
                  Privacy Policy
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300" aria-hidden="true" />
                </a>
                <a 
                  href="#" 
                  className="relative group text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px] flex items-center justify-center font-medium transition-colors duration-300"
                >
                  Terms of Service
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300" aria-hidden="true" />
                </a>
                <a 
                  href="#" 
                  className="relative group text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 min-h-[44px] flex items-center justify-center font-medium transition-colors duration-300"
                >
                  Contact
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300" aria-hidden="true" />
                </a>
              </div>
            </nav>
            
            {/* Copyright */}
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
              © {new Date().getFullYear()} ConvertAll Hub. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
