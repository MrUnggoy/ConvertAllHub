import { LucideIcon, DollarSign, UserX, Shield, Lock, Clock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export interface TrustBadge {
  icon: LucideIcon
  text: string
  description: string
  metric?: {
    value: string
    label: string
  }
  tooltip?: string
}

interface TrustBadgesProps {
  badges?: TrustBadge[]
  layout?: 'horizontal' | 'grid' | 'compact'
  showMetrics?: boolean
  className?: string
}

const defaultBadges: TrustBadge[] = [
  {
    icon: DollarSign,
    text: '100% Free',
    description: 'No hidden costs, no credit card required',
    tooltip: 'All conversion tools are completely free to use with no limitations'
  },
  {
    icon: UserX,
    text: 'No Signup Required',
    description: 'Start converting immediately',
    tooltip: 'No account creation needed - just upload and convert'
  },
  {
    icon: Shield,
    text: 'Privacy-First',
    description: 'Files processed client-side when possible',
    tooltip: 'Your privacy is our priority - we minimize data collection'
  },
  {
    icon: Clock,
    text: 'Auto-Delete',
    description: 'Files deleted after 1 hour',
    tooltip: 'All uploaded files are automatically deleted from our servers after 1 hour'
  },
  {
    icon: Lock,
    text: 'Secure',
    description: '256-bit encryption for uploads',
    tooltip: 'All file transfers use industry-standard 256-bit encryption'
  },
  {
    icon: Users,
    text: '10,000+ Conversions',
    description: 'Trusted by users worldwide',
    metric: {
      value: '10,000+',
      label: 'Files Converted'
    },
    tooltip: 'Join thousands of satisfied users who trust our conversion tools'
  }
]

const badgeGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-amber-500 to-orange-600'
]

export default function TrustBadges({ 
  badges = defaultBadges, 
  layout = 'horizontal',
  showMetrics = true,
  className 
}: TrustBadgesProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const containerClass = layout === 'grid' 
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6'
    : layout === 'compact'
    ? 'flex flex-wrap justify-center gap-3'
    : 'flex flex-col sm:flex-row sm:flex-wrap justify-center gap-6 sm:gap-8'

  const badgeClass = layout === 'compact'
    ? 'flex items-center gap-2 px-3 py-2 rounded-lg'
    : 'flex items-center gap-4 p-4 rounded-2xl'

  const iconSize = layout === 'compact' ? 'w-10 h-10' : 'w-14 h-14'
  const iconInnerSize = layout === 'compact' ? 'w-5 h-5' : 'w-7 h-7'

  return (
    <div 
      ref={containerRef}
      className={cn(containerClass, className)}
    >
      {badges.map((badge, index) => {
        const gradient = badgeGradients[index % badgeGradients.length]
        const isHovered = hoveredIndex === index
        
        return (
          <div 
            key={index}
            className={cn(
              "group relative flex items-center transition-all duration-500",
              badgeClass,
              "bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50",
              "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
              layout !== 'compact' && "hover:shadow-premium hover:scale-105 hover:-translate-y-1",
              layout === 'compact' && "hover:shadow-md hover:scale-102",
              "cursor-default",
              isVisible ? "animate-slide-up" : "opacity-0"
            )}
            style={{
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label={badge.tooltip || badge.description}
          >
            {/* Icon with gradient background */}
            <div className={cn(
              "relative flex-shrink-0 rounded-xl",
              iconSize,
              "bg-gradient-to-br",
              gradient,
              "flex items-center justify-center",
              "shadow-lg group-hover:shadow-xl",
              "transition-all duration-500",
              layout !== 'compact' && "group-hover:scale-110 group-hover:rotate-6",
              layout === 'compact' && "group-hover:scale-105"
            )}>
              {/* Glow effect */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl",
                  "bg-gradient-to-br",
                  gradient
                )}
              />
              
              <badge.icon className={cn("relative z-10 text-white", iconInnerSize)} />
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <span className={cn(
                "font-bold text-gray-900 dark:text-white block leading-tight",
                layout === 'compact' ? 'text-sm' : 'text-base'
              )}>
                {badge.text}
              </span>
              {badge.description && layout !== 'compact' && (
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                  {badge.description}
                </span>
              )}
              {badge.metric && showMetrics && layout !== 'compact' && (
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {badge.metric.value}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {badge.metric.label}
                  </span>
                </div>
              )}
            </div>

            {/* Tooltip */}
            {badge.tooltip && isHovered && (
              <div 
                className={cn(
                  "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700",
                  "rounded-lg shadow-xl pointer-events-none",
                  "transition-opacity duration-200",
                  layout === 'compact' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'top-full mt-2 left-0 right-0'
                )}
                style={{
                  maxWidth: layout === 'compact' ? '200px' : '100%'
                }}
              >
                {badge.tooltip}
                {/* Arrow */}
                <div 
                  className={cn(
                    "absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45",
                    layout === 'compact' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : 'top-[-4px] left-4'
                  )}
                />
              </div>
            )}

            {/* Shimmer effect on hover */}
            <div 
              className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden",
                layout === 'compact' ? 'rounded-lg' : 'rounded-2xl'
              )}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite'
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
