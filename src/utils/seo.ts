import { toolRegistry } from '@/tools/registry'

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonicalUrl?: string
  structuredData?: object
}

export interface ToolSEOData extends SEOData {
  toolId: string
  category: string
  inputFormats: string[]
  outputFormats: string[]
}

// SEO data for each tool
export const getToolSEOData = (toolId: string): ToolSEOData | null => {
  const tool = toolRegistry.getTool(toolId)
  if (!tool) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://convertall.hub'
  
  return {
    toolId: tool.id,
    category: tool.category,
    title: `${tool.name} - Free Online ${tool.category.toUpperCase()} Tool | ConvertAll Hub`,
    description: `${tool.description}. Convert ${tool.inputFormats.join(', ')} to ${tool.outputFormats.join(', ')} online for free. Fast, secure, and privacy-focused conversion tool.`,
    keywords: [
      tool.name.toLowerCase(),
      ...tool.inputFormats.map(f => f.toLowerCase()),
      ...tool.outputFormats.map(f => f.toLowerCase()),
      'converter',
      'online',
      'free',
      tool.category,
      'file conversion'
    ],
    canonicalUrl: `${baseUrl}/tool/${toolId}`,
    inputFormats: tool.inputFormats,
    outputFormats: tool.outputFormats,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.name,
      description: tool.description,
      url: `${baseUrl}/tool/${toolId}`,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: [
        `Convert ${tool.inputFormats.join(', ')} files`,
        `Export to ${tool.outputFormats.join(', ')} formats`,
        ...(tool.clientSideSupported ? ['Client-side processing for privacy'] : []),
        ...tool.proFeatures
      ]
    }
  }
}

// SEO data for category pages
export const getCategorySEOData = (category: string): SEOData => {
  const categoryNames = {
    pdf: 'PDF',
    image: 'Image',
    audio: 'Audio', 
    video: 'Video',
    text: 'Text',
    ocr: 'OCR',
    qr: 'QR Code'
  }

  const categoryName = categoryNames[category as keyof typeof categoryNames] || category
  const tools = toolRegistry.getToolsByCategory(category)
  
  return {
    title: `${categoryName} Tools - Free Online ${categoryName} Converters | ConvertAll Hub`,
    description: `Free online ${categoryName.toLowerCase()} conversion tools. ${tools.length} powerful ${categoryName.toLowerCase()} converters and processors. Fast, secure, and privacy-focused.`,
    keywords: [
      categoryName.toLowerCase(),
      'converter',
      'online',
      'free',
      'tools',
      ...tools.flatMap(t => t.inputFormats.map(f => f.toLowerCase()))
    ]
  }
}

// SEO data for home page
export const getHomeSEOData = (): SEOData => {
  const totalTools = toolRegistry.getAllTools().length
  
  return {
    title: 'ConvertAll Hub - Free Online File Conversion Tools',
    description: `Convert files online for free with ${totalTools}+ powerful conversion tools. PDF, Image, Audio, Video, Text, OCR, and QR code tools. Fast, secure, and privacy-focused.`,
    keywords: [
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
  }
}

// Generate sitemap.xml content
export const generateSitemap = (): string => {
  const baseUrl = 'https://convertall.hub'
  const currentDate = new Date().toISOString().split('T')[0]
  
  const urls = [
    // Home page
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '1.0'
    },
    // Category pages
    ...['pdf', 'image', 'audio', 'video', 'text', 'ocr', 'qr'].map(category => ({
      loc: `${baseUrl}/category/${category}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    })),
    // Tool pages
    ...toolRegistry.getAllTools().map(tool => ({
      loc: `${baseUrl}/tool/${tool.id}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.9'
    }))
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return sitemapXml
}

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://convertall.hub'
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`
}