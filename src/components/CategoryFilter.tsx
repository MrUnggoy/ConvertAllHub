import { FileText, Image, Music, Video, FileType, Eye, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCallback } from 'react'

export interface Category {
  id: 'pdf' | 'image' | 'audio' | 'video' | 'text' | 'ocr' | 'qr'
  name: string
  icon: typeof FileText
  count: number
  gradient: string
  activeGradient: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  className?: string
}

const categoryIcons = {
  pdf: FileText,
  image: Image,
  audio: Music,
  video: Video,
  text: FileType,
  ocr: Eye,
  qr: QrCode
}

const categoryGradients: Record<string, {
  gradient: string
  activeGradient: string
  hoverShadow: string
}> = {
  pdf: {
    gradient: 'from-blue-500 to-indigo-600',
    activeGradient: 'from-blue-600 to-indigo-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'
  },
  image: {
    gradient: 'from-green-500 to-teal-600',
    activeGradient: 'from-green-600 to-teal-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
  },
  audio: {
    gradient: 'from-purple-500 to-violet-600',
    activeGradient: 'from-purple-600 to-violet-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
  },
  video: {
    gradient: 'from-red-500 to-pink-600',
    activeGradient: 'from-red-600 to-pink-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]'
  },
  text: {
    gradient: 'from-amber-500 to-orange-600',
    activeGradient: 'from-amber-600 to-orange-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]'
  },
  ocr: {
    gradient: 'from-indigo-500 to-cyan-600',
    activeGradient: 'from-indigo-600 to-cyan-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'
  },
  qr: {
    gradient: 'from-pink-500 to-fuchsia-600',
    activeGradient: 'from-pink-600 to-fuchsia-700',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]'
  }
}

// Default gradient for unknown categories
const defaultGradient = {
  gradient: 'from-gray-500 to-slate-600',
  activeGradient: 'from-gray-600 to-slate-700',
  hoverShadow: 'hover:shadow-[0_0_20px_rgba(107,114,128,0.3)]'
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategorySelect,
  className
}: CategoryFilterProps) {
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0)

  // Memoize category selection handler to prevent unnecessary re-renders
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    // Use requestIdleCallback to defer non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        onCategorySelect(categoryId)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        onCategorySelect(categoryId)
      }, 0)
    }
  }, [onCategorySelect])

  return (
    <div className={cn('space-y-4', className)} role="group" aria-label="Filter tools by category">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Categories
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {/* All Categories Button */}
        <button
          onClick={() => handleCategorySelect(null)}
          className={cn(
            'group relative px-4 py-2.5 rounded-lg font-semibold text-sm',
            'transition-all duration-300 ease-out',
            'min-h-[44px] min-w-[44px]',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            selectedCategory === null
              ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 hover:shadow-md'
          )}
          aria-pressed={selectedCategory === null}
          aria-label={`Show all tools (${totalCount} tools)`}
        >
          <span className="flex items-center space-x-2">
            <span>All</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-bold',
              selectedCategory === null
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}>
              {totalCount}
            </span>
          </span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => {
          const Icon = categoryIcons[category.id] || FileType // Fallback to FileType icon
          const colors = categoryGradients[category.id] || defaultGradient
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={cn(
                'group relative px-4 py-2.5 rounded-lg font-semibold text-sm',
                'transition-all duration-300 ease-out',
                'min-h-[44px] min-w-[44px]',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? `bg-gradient-to-r ${colors.activeGradient} text-white shadow-lg scale-105`
                  : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-transparent hover:scale-105 ${colors.hoverShadow}`,
                !isSelected && `hover:bg-gradient-to-r hover:${colors.gradient} hover:text-white`
              )}
              aria-pressed={isSelected}
              aria-label={`Filter by ${category.name} (${category.count} tools)`}
            >
              <span className="flex items-center space-x-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="capitalize">{category.name}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-white/20 group-hover:text-white'
                )}>
                  {category.count}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
