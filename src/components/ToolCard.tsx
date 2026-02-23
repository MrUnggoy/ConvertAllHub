import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolDefinition, toolRegistry } from '@/tools/registry'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: ToolDefinition
  variant?: 'default' | 'compact'
  showCategory?: boolean
  showFormats?: boolean
  className?: string
}

const categoryColors: Record<string, { 
  gradient: string
  glow: string
  badge: string
  badgeDark: string
  icon: string
}> = {
  pdf: { 
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    glow: 'group-hover:shadow-glow-blue',
    badge: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
    badgeDark: 'dark:from-blue-600 dark:to-indigo-700',
    icon: 'text-blue-600 dark:text-blue-400 group-hover:text-blue-500'
  },
  image: { 
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    glow: 'group-hover:shadow-glow-green',
    badge: 'bg-gradient-to-r from-green-500 to-teal-600 text-white',
    badgeDark: 'dark:from-green-600 dark:to-teal-700',
    icon: 'text-green-600 dark:text-green-400 group-hover:text-green-500'
  },
  audio: { 
    gradient: 'from-purple-500 via-violet-600 to-purple-600',
    glow: 'group-hover:shadow-glow-purple',
    badge: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white',
    badgeDark: 'dark:from-purple-600 dark:to-violet-700',
    icon: 'text-purple-600 dark:text-purple-400 group-hover:text-purple-500'
  },
  video: { 
    gradient: 'from-red-500 via-rose-600 to-pink-600',
    glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    badge: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
    badgeDark: 'dark:from-red-600 dark:to-pink-700',
    icon: 'text-red-600 dark:text-red-400 group-hover:text-red-500'
  },
  text: { 
    gradient: 'from-amber-500 via-orange-600 to-yellow-600',
    glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    badge: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    badgeDark: 'dark:from-amber-600 dark:to-orange-700',
    icon: 'text-amber-600 dark:text-amber-400 group-hover:text-amber-500'
  },
  ocr: { 
    gradient: 'from-indigo-500 via-blue-600 to-cyan-600',
    glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    badge: 'bg-gradient-to-r from-indigo-500 to-cyan-600 text-white',
    badgeDark: 'dark:from-indigo-600 dark:to-cyan-700',
    icon: 'text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500'
  },
  qr: { 
    gradient: 'from-pink-500 via-rose-600 to-fuchsia-600',
    glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    badge: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white',
    badgeDark: 'dark:from-pink-600 dark:to-fuchsia-700',
    icon: 'text-pink-600 dark:text-pink-400 group-hover:text-pink-500'
  }
}

export default function ToolCard({ 
  tool, 
  showCategory = true,
  showFormats = true,
  className 
}: ToolCardProps) {
  const colors = categoryColors[tool.category] || categoryColors.pdf

  return (
    <Link 
      to={toolRegistry.getToolRoute(tool.id)}
      aria-label={`${tool.name} - ${tool.description}`}
      className="group block focus:outline-none"
    >
      <Card 
        className={cn(
          "cursor-pointer h-full transition-all duration-500 ease-out",
          "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
          "border-2 border-gray-200/50 dark:border-gray-800/50",
          "hover:border-transparent",
          "shadow-premium hover:shadow-premium-lg",
          colors.glow,
          "hover:scale-[1.02] hover:-translate-y-1",
          "active:scale-[0.98] active:translate-y-0",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          "group-focus:ring-2 group-focus:ring-primary group-focus:ring-offset-2",
          "min-h-[44px]",
          "relative overflow-hidden",
          className
        )}
        role="article"
        aria-label={`${tool.name} tool card`}
      >
        {/* Gradient border effect on hover */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-br",
            colors.gradient,
            "rounded-lg"
          )}
          style={{ padding: '2px' }}
        >
          <div className="absolute inset-[2px] bg-white dark:bg-gray-900 rounded-lg" />
        </div>

        {/* Shimmer effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite'
          }}
        />
        
        <div className="relative z-10">
          <CardHeader className="min-h-[44px]">
            <CardTitle className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300",
                "bg-gradient-to-br",
                colors.gradient,
                "group-hover:scale-110 group-hover:rotate-3"
              )}>
                <tool.icon 
                  className="h-5 w-5 text-white" 
                  aria-hidden="true"
                />
              </div>
              <span className="font-bold text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-300">
                {tool.name}
              </span>
            </CardTitle>
            <CardDescription className="text-base leading-relaxed mt-2">
              {tool.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {showFormats && (
                <div className="flex flex-wrap gap-2" role="list" aria-label="Supported file formats">
                  {tool.inputFormats.slice(0, 3).map((format) => (
                    <span
                      key={format}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold",
                        "bg-gradient-to-r",
                        colors.badge,
                        colors.badgeDark,
                        "shadow-sm hover:shadow-md transition-all duration-300",
                        "transform hover:scale-105"
                      )}
                      role="listitem"
                    >
                      {format}
                    </span>
                  ))}
                  {tool.inputFormats.length > 3 && (
                    <span 
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium shadow-sm"
                      role="listitem"
                      aria-label={`${tool.inputFormats.length - 3} more formats supported`}
                    >
                      +{tool.inputFormats.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm flex-wrap gap-3 pt-2">
                {showCategory && (
                  <span className={cn(
                    "capitalize px-3 py-1.5 rounded-lg font-semibold text-xs",
                    "bg-gradient-to-r",
                    colors.badge,
                    colors.badgeDark,
                    "shadow-sm"
                  )}>
                    {tool.category}
                  </span>
                )}
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  {tool.clientSideSupported && (
                    <span 
                      className="flex items-center space-x-1.5 text-green-600 dark:text-green-400 font-medium text-xs bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg"
                      aria-label="Client-side processing - your files never leave your device"
                    >
                      <span aria-hidden="true">🔒</span>
                      <span>Private</span>
                    </span>
                  )}
                  {tool.proFeatures.length > 0 && (
                    <span 
                      className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-medium text-xs bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg"
                      aria-label="Pro features available"
                    >
                      <span aria-hidden="true">⭐</span>
                      <span>Pro</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
