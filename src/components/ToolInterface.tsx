import { Tool } from '@/tools/registry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ToolInterfaceProps {
  tool: Tool
}

export default function ToolInterface({ tool }: ToolInterfaceProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <tool.icon className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <p className="text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Formats</CardTitle>
          <CardDescription>
            This tool supports the following file formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tool.supportedFormats.map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium"
              >
                {format}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tool Interface</CardTitle>
          <CardDescription>
            Tool-specific interface will be implemented here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Tool interface coming soon...</p>
            <p className="text-sm mt-2">
              This is where the {tool.name.toLowerCase()} functionality will be implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}