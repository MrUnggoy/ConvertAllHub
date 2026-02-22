import { LucideIcon, DollarSign, UserX, Shield, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export interface TrustBadge {
  icon: LucideIcon
  text: string
  description?: string
}

interface TrustBadgesProps {
  badges?: TrustBadge[]
  layout?: 'horizontal' | 'grid'
  className?: string
}

const defaultBadges: TrustBadge[] = [
  {
    icon: DollarSign,
    text: '100% Free',
    description: 'No hidden costs'
  },
  {
    icon: UserX,
    text: 'No Signup Required',
    description: 'Start converting immediately'
  },
  {
    icon: Shield,
    text: 'Privacy-First',
    description: 'Your files stay private'
  },
  {
    icon: Lock,
    text: 'Client-Side Processing',
    description: 'Files never leave your device'
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
  className 
}: TrustBadgesProps) {
  const [isVisible, setIsVisible] = useState(false)
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
    ? 'grid grid-cols-2 md:grid-cols-4 gap-6'
    : 'flex flex-col sm:flex-row sm:flex-wrap justify-center gap-6 sm:gap-8'

  return (
    <div 
      ref={containerRef}
      className={cn(containerClass, className)}
    >
      {badges.map((badge, index) => {
        const gradient = badgeGradients[index % badgeGradients.length]
        
        return (
          <div 
            key={index}
            className={cn(
              "group flex items-center gap-4 p-4 rounded-2xl transition-all duration-500",
              "bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50",
              "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
              "hover:shadow-premium hover:scale-105 hover:-translate-y-1",
              "cursor-default",
              isVisible ? "animate-slide-up" : "opacity-0"
            )}
            style={{
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
            title={badge.description}
          >
            {/* Icon with gradient background */}
            <div className={cn(
              "relative flex-shrink-0 w-14 h-14 rounded-xl",
              "bg-gradient-to-br",
              gradient,
              "flex items-center justify-center",
              "shadow-lg group-hover:shadow-xl",
              "transition-all duration-500",
              "group-hover:scale-110 group-hover:rotate-6"
            )}>
              {/* Glow effect */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl",
                  "bg-gradient-to-br",
                  gradient
                )}
              />
              
              <badge.icon className="relative z-10 w-7 h-7 text-white" />
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <span className="font-bold text-base text-gray-900 dark:text-white block leading-tight">
                {badge.text}
              </span>
              {badge.description && (
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                  {badge.description}
                </span>
              )}
            </div>

            {/* Shimmer effect on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl overflow-hidden"
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
