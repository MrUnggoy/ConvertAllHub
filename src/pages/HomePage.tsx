import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toolRegistry } from '@/tools/registry'

export default function HomePage() {
  const tools = toolRegistry.getAllTools()
  
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            ConvertAll Hub
          </h1>
          <p className="text-xl text-gray-600">
            Free online file conversion tools - PDF and Image processing
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {tools.length} professional tools available • All client-side processing
          </p>
        </div>
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
                  <div className="flex flex-wrap gap-1">
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
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded-sm">
                      {tool.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      {tool.clientSideSupported && (
                        <span className="flex items-center space-x-1 text-green-600">
                          <span>🔒</span>
                          <span>Client-side</span>
                        </span>
                      )}
                      {tool.proFeatures.length > 0 && (
                        <span className="text-amber-600">
                          ⭐ Pro
                        </span>
                      )}
                    </div>
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