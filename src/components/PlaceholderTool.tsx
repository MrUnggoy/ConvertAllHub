import { ToolDefinition } from '@/tools/registry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PlaceholderToolProps {
  tool: ToolDefinition
}

export default function PlaceholderTool({ tool }: PlaceholderToolProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <tool.icon className="h-6 w-6" />
            <span>{tool.name}</span>
          </CardTitle>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Input Formats:</h4>
              <div className="flex flex-wrap gap-2">
                {tool.inputFormats.map((format) => (
                  <span
                    key={format}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-sm text-xs"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Output Formats:</h4>
              <div className="flex flex-wrap gap-2">
                {tool.outputFormats.map((format) => (
                  <span
                    key={format}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-sm text-xs"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {tool.clientSideSupported && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <span>🔒</span>
                  <span>Client-side processing</span>
                </div>
              )}
              {tool.proFeatures.length > 0 && (
                <div className="text-sm text-amber-600">
                  ⭐ Pro features available
                </div>
              )}
            </div>
          </div>

          {tool.proFeatures.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-md">
              <h4 className="font-medium mb-2 text-amber-800">Pro Features:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {tool.proFeatures.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground space-y-2">
            <p className="text-lg">🚧 Tool Coming Soon</p>
            <p>This tool is currently under development.</p>
            <p className="text-sm">Check back soon for full functionality!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}