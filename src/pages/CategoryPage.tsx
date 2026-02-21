import { useParams, Navigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toolRegistry } from '@/tools/registry'

const categoryNames = {
  pdf: 'PDF Tools',
  image: 'Image Tools',
  audio: 'Audio Tools',
  video: 'Video Tools',
  text: 'Text Tools',
  ocr: 'OCR Tools',
  qr: 'QR Tools'
}

const categoryDescriptions = {
  pdf: 'Convert, extract, and manipulate PDF documents',
  image: 'Transform and enhance your images',
  audio: 'Convert and process audio files',
  video: 'Convert and compress video files',
  text: 'Format and transform text content',
  ocr: 'Extract text from images and documents',
  qr: 'Generate and decode QR codes'
}

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>()
  
  if (!category) {
    return <Navigate to="/" replace />
  }

  const tools = toolRegistry.getToolsByCategory(category)
  
  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Category Not Found</h1>
        <p className="text-gray-600 mt-2">
          The category "{category}" could not be found or has no tools available.
        </p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to all tools
        </Link>
      </div>
    )
  }

  const categoryName = categoryNames[category as keyof typeof categoryNames] || category
  const categoryDescription = categoryDescriptions[category as keyof typeof categoryDescriptions] || ''

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{categoryName}</h1>
        {categoryDescription && (
          <p className="text-xl text-gray-600 mt-2">
            {categoryDescription}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {tools.length} tool{tools.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} to={toolRegistry.getToolRoute(tool.id)}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <tool.icon className="h-5 w-5" />
                  <span>{tool.name}</span>
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {tool.inputFormats.slice(0, 3).map((format) => (
                        <span
                          key={format}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-sm text-xs"
                        >
                          {format}
                        </span>
                      ))}
                      {tool.inputFormats.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-sm text-xs">
                          +{tool.inputFormats.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {tool.clientSideSupported && (
                      <span className="flex items-center space-x-1 text-green-600">
                        <span>🔒</span>
                        <span>Client-side</span>
                      </span>
                    )}
                    {tool.proFeatures.length > 0 && (
                      <span className="text-amber-600">
                        ⭐ Pro features
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}