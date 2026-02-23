import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { debounce } from '@/utils/performance'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
  showWhenToolCount?: number
  currentToolCount: number
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search tools...',
  debounceMs = 300,
  className,
  showWhenToolCount = 12,
  currentToolCount
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Create debounced search function using performance utility
  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      onSearch(searchQuery)
    }, debounceMs)
  ).current

  // Only show search bar when tool count exceeds threshold
  if (currentToolCount <= showWhenToolCount) {
    return null
  }

  // Handle query changes with debounced search
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    debouncedSearch(newQuery)
  }, [debouncedSearch])

  const handleClear = () => {
    setQuery('')
    debouncedSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="tool-search" className="sr-only">
        Search conversion tools
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search 
            className={cn(
              'h-5 w-5 transition-colors duration-200',
              isFocused 
                ? 'text-blue-500 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            )}
            aria-hidden="true"
          />
        </div>
        
        <input
          ref={inputRef}
          id="tool-search"
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-12 py-3 rounded-lg',
            'bg-white dark:bg-gray-800',
            'border-2 transition-all duration-200',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'min-h-[44px]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isFocused
              ? 'border-blue-500 dark:border-blue-400 shadow-lg'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          )}
          aria-label="Search conversion tools"
          aria-describedby="search-description"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className={cn(
              'absolute inset-y-0 right-0 flex items-center pr-4',
              'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
              'min-h-[44px] min-w-[44px]'
            )}
            aria-label="Clear search"
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
      
      <p id="search-description" className="sr-only">
        Search through {currentToolCount} available conversion tools by name or description
      </p>
    </div>
  )
}
