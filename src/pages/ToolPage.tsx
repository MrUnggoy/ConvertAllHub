import React, { Suspense, useState, useCallback } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { toolRegistry } from '@/tools/registry'
import { useConversion } from '@/contexts/ConversionContext'
import MetaTags from '@/components/seo/MetaTags'
import SchemaMarkup, { createSoftwareApplicationSchema } from '@/components/seo/SchemaMarkup'
import ToolDocumentation from '@/components/tools/ToolDocumentation'
import ConversionFlow, { ConversionFlowResult } from '@/components/ConversionFlow'
import ErrorDisplay, { ConversionError } from '@/components/ErrorDisplay'
import LoadingIndicator from '@/components/LoadingIndicator'

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>()
  const { setCurrentTool } = useConversion()
  const [conversionError, setConversionError] = useState<ConversionError | null>(null)
  const [showLegacyTool, setShowLegacyTool] = useState(false)
  
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

  // Handle conversion completion
  const handleConversionComplete = useCallback((result: ConversionFlowResult) => {
    console.log('Conversion completed:', result)
    setConversionError(null)
  }, [])

  // Handle conversion error
  const handleConversionError = useCallback((error: ConversionError) => {
    console.error('Conversion error:', error)
    setConversionError(error)
  }, [])

  // Dismiss error
  const handleDismissError = useCallback(() => {
    setConversionError(null)
  }, [])

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
    <article className="space-y-6">
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

      <header className="flex items-center space-x-3">
        <tool.icon className="h-8 w-8" aria-hidden="true" />
        <div>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="text-gray-600">{tool.description}</p>
        </div>
      </header>

      {/* Global Error Display */}
      {conversionError && (
        <ErrorDisplay
          error={conversionError}
          severity="error"
          onDismiss={handleDismissError}
        />
      )}

      <section aria-label="Tool interface">
        {/* Use ConversionFlow for new UX-optimized experience */}
        {!showLegacyTool ? (
          <ConversionFlow
            toolId={toolId}
            inputFormats={tool.inputFormats}
            outputFormats={tool.outputFormats}
            onComplete={handleConversionComplete}
            onError={handleConversionError}
            maxFileSize={50 * 1024 * 1024} // 50MB default
          />
        ) : (
          /* Fallback to legacy tool component if needed */
          <Suspense fallback={
            <LoadingIndicator
              type="spinner"
              size="large"
              message="Loading tool..."
            />
          }>
            <ToolComponent tool={tool} />
          </Suspense>
        )}

        {/* Toggle for testing/debugging - can be removed in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowLegacyTool(!showLegacyTool)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {showLegacyTool ? 'Switch to ConversionFlow' : 'Switch to Legacy Tool'}
            </button>
          </div>
        )}
      </section>

      {/* Tool Documentation */}
      <section aria-label="Tool documentation">
        <ToolDocumentation tool={tool} />
      </section>
    </article>
  )
}