import { Link, useLocation } from 'react-router-dom'
import { FileText, Image, Music, Video, Type, Eye, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toolRegistry } from '@/tools/registry'

const categoryIcons = {
  pdf: FileText,
  image: Image,
  audio: Music,
  video: Video,
  text: Type,
  ocr: Eye,
  qr: QrCode
}

const categoryNames = {
  pdf: 'PDF Tools',
  image: 'Image Tools',
  audio: 'Audio Tools',
  video: 'Video Tools',
  text: 'Text Tools',
  ocr: 'OCR Tools',
  qr: 'QR Tools'
}

export default function ToolCategoryNav() {
  const location = useLocation()
  const currentPath = location.pathname

  // Get all available categories from the registry
  const availableCategories = Array.from(
    new Set(toolRegistry.getAllTools().map(tool => tool.category))
  ).sort()

  return (
    <nav className="border-b bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 overflow-x-auto py-2">
          <Link
            to="/"
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              currentPath === "/" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <span>All Tools</span>
          </Link>
          
          {availableCategories.map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons]
            const categoryPath = `/category/${category}`
            const toolCount = toolRegistry.getToolsByCategory(category).length
            
            return (
              <Link
                key={category}
                to={categoryPath}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  currentPath === categoryPath
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{categoryNames[category as keyof typeof categoryNames]}</span>
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {toolCount}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}