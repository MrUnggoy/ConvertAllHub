import { useState, useMemo, useCallback, useTransition } from 'react'
import { ToolDefinition } from '@/tools/registry'
import CategoryFilter, { Category } from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import ToolCard from '@/components/ToolCard'
import { cn } from '@/lib/utils'

interface ToolLibraryProps {
  tools: ToolDefinition[]
  className?: string
}

export default function ToolLibrary({ tools, className }: ToolLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Calculate categories with tool counts - memoized to prevent recalculation
  const categories: Category[] = useMemo(() => {
    const categoryMap = new Map<string, number>()
    
    tools.forEach(tool => {
      categoryMap.set(tool.category, (categoryMap.get(tool.category) || 0) + 1)
    })

    return Array.from(categoryMap.entries()).map(([id, count]) => ({
      id: id as Category['id'],
      name: id,
      icon: null as any, // Icon is handled in CategoryFilter
      count,
      gradient: '',
      activeGradient: ''
    }))
  }, [tools])

  // Debounced search handler using useTransition for non-blocking updates
  const handleSearch = useCallback((query: string) => {
    startTransition(() => {
      setSearchQuery(query)
    })
  }, [])

  // Debounced category selection handler using useTransition
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    startTransition(() => {
      setSelectedCategory(categoryId)
    })
  }, [])

  // Filter tools based on category and search query - optimized with useMemo
  const filteredTools = useMemo(() => {
    let result = tools

    // Filter by category
    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.inputFormats.some(format => format.toLowerCase().includes(query))
      )
    }

    return result
  }, [tools, selectedCategory, searchQuery])

  return (
    <div className={cn('space-y-8', className)}>
      {/* Search Bar - conditionally displayed */}
      <SearchBar
        onSearch={handleSearch}
        currentToolCount={tools.length}
        showWhenToolCount={12}
        placeholder="Search tools by name, description, or format..."
      />

      {/* Category Filter */}
      <nav aria-label="Tool categories">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </nav>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
          {filteredTools.length === tools.length ? (
            <span>
              Showing all <strong className="font-semibold text-gray-900 dark:text-white">{tools.length}</strong> tools
            </span>
          ) : (
            <span>
              Found <strong className="font-semibold text-gray-900 dark:text-white">{filteredTools.length}</strong> of {tools.length} tools
            </span>
          )}
        </p>
      </div>

      {/* Tools Grid - Responsive Layout with optimized rendering */}
      {filteredTools.length > 0 ? (
        <div 
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            isPending && "opacity-70 transition-opacity duration-200"
          )}
          role="list"
          aria-label="Conversion tools"
          aria-busy={isPending}
        >
          {filteredTools.map((tool) => (
            <div key={tool.id} role="listitem">
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16 px-4" role="status">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No tools found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery ? (
              <>
                No tools match your search for "<strong>{searchQuery}</strong>".
                Try different keywords or browse all categories.
              </>
            ) : (
              <>
                No tools available in the {selectedCategory} category.
                Try selecting a different category.
              </>
            )}
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSearchQuery('')
            }}
            className={cn(
              'px-6 py-3 rounded-lg font-semibold',
              'bg-gradient-to-r from-blue-500 to-indigo-600',
              'text-white shadow-lg',
              'hover:from-blue-600 hover:to-indigo-700',
              'hover:scale-105 hover:shadow-xl',
              'transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'min-h-[44px]'
            )}
            aria-label="Clear all filters and show all tools"
          >
            Show All Tools
          </button>
        </div>
      )}
    </div>
  )
}
