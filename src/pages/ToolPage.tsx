import React, { Suspense } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { toolRegistry } from '@/tools/registry'
import { useConversion } from '@/contexts/ConversionContext'
import MetaTags from '@/components/seo/MetaTags'
import SchemaMarkup, { createSoftwareApplicationSchema } from '@/components/seo/SchemaMarkup'
import ToolDocumentation from '@/components/tools/ToolDocumentation'

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>()
  const { setCurrentTool } = useConversion()
  
  if (!toolId) {
    return <Navigate to="/" replace />
  }

  const tool = toolRegistry.getTool(toolId)
  
  if (!tool) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Tool Not Found</h1>
        <p className="text-gray-600 mt-2">
          The requested tool "{toolId}" could not be found.
        </p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to all tools
        </Link>
      </div>
    )
  }

  // Set current tool in context
  React.useEffect(() => {
    setCurrentTool(toolId)
  }, [toolId, setCurrentTool])

  const ToolComponent = tool.component

  // SEO data for tool page
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://convertall.hub'
  const toolUrl = `${baseUrl}/tool/${toolId}`
  const seoTitle = `${tool.name} - Free Online ${tool.category.toUpperCase()} Tool | ConvertAll Hub`
  const seoDescription = `${tool.description}. Convert ${tool.inputFormats.join(', ')} to ${tool.outputFormats.join(', ')} online for free. Fast, secure, and privacy-focused conversion tool.`
  const seoKeywords = [
    tool.name.toLowerCase(),
    ...tool.inputFormats.map(f => f.toLowerCase()),
    ...tool.outputFormats.map(f => f.toLowerCase()),
    'converter',
    'online',
    'free',
    tool.category,
    'file conversion'
  ]

  // Schema markup for tool
  const toolSchema = createSoftwareApplicationSchema(
    tool.name,
    tool.description,
    toolUrl,
    tool.category,
    tool.inputFormats,
    tool.outputFormats
  )

  return (
    <div className="space-y-6">
      {/* SEO Meta Tags */}
      <MetaTags
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={toolUrl}
        type="website"
      />

      {/* Schema Markup */}
      <SchemaMarkup type="SoftwareApplication" data={toolSchema} />

      <div className="flex items-center space-x-3">
        <tool.icon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="text-gray-600">{tool.description}</p>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading tool...</p>
          </div>
        </div>
      }>
        <ToolComponent tool={tool} />
      </Suspense>

      {/* Tool Documentation */}
      <ToolDocumentation tool={tool} />
    </div>
  )
}