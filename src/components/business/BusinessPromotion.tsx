import { cn } from '@/lib/utils'

export interface BusinessPromotionConfig {
  id: string
  enabled: boolean
  title: string
  description: string
  linkUrl?: string
  linkText?: string
  imageUrl?: string
  backgroundColor?: string
  position: 'header' | 'footer' | 'sidebar' | 'inline'
}

interface BusinessPromotionProps {
  config: BusinessPromotionConfig
  className?: string
}

export default function BusinessPromotion({ config, className }: BusinessPromotionProps) {
  if (!config.enabled) {
    return null
  }

  return (
    <div 
      className={cn(
        "rounded-lg border p-4 sm:p-6",
        config.backgroundColor || "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">From the Creator</p>
          <h3 className="text-base sm:text-lg font-semibold mb-2">{config.title}</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">{config.description}</p>
          {config.linkUrl && config.linkText && (
            <a 
              href={config.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 min-h-[44px]"
            >
              {config.linkText} →
            </a>
          )}
        </div>
        {config.imageUrl && (
          <img 
            src={config.imageUrl} 
            alt={config.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
      </div>
    </div>
  )
}
