/**
 * InlineHelp Component
 * 
 * Provides contextual help text for each step in the ConversionFlow.
 * Validates: Requirements 5.4 (Inline help text)
 * 
 * Features:
 * - Collapsible help text to save space on mobile
 * - Mobile-optimized collapsed state
 * - aria-describedby associations for accessibility
 * - Smooth expand/collapse animations
 * - Icon-based visual indicators
 * - Keyboard accessible (Enter/Space to toggle)
 * 
 * @example
 * // Basic usage with collapsible help
 * <InlineHelp
 *   id="file-selection-help"
 *   title="Need help selecting a file?"
 *   content="Click the upload area or drag and drop your file. Supported formats: PDF, DOCX, JPG, PNG."
 * />
 * 
 * @example
 * // Always expanded help (non-collapsible)
 * <InlineHelp
 *   id="format-help"
 *   title="Choose your output format"
 *   content="Select the format you want to convert your file to."
 *   collapsible={false}
 * />
 * 
 * @example
 * // With aria-describedby association
 * <input
 *   type="file"
 *   aria-describedby="file-input-help"
 * />
 * <InlineHelp
 *   id="file-input-help"
 *   content="Maximum file size: 10MB"
 * />
 */

import React, { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InlineHelpProps {
  /** Unique ID for aria-describedby associations */
  id: string
  /** Optional title/heading for the help text */
  title?: string
  /** Help text content */
  content: string
  /** Whether the help text is collapsible (default: true on mobile, false on desktop) */
  collapsible?: boolean
  /** Initial collapsed state (default: true on mobile, false on desktop) */
  defaultCollapsed?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * InlineHelp Component
 * 
 * Displays contextual help text with optional collapsible behavior.
 * Optimized for mobile with collapsed state by default to save space.
 * Properly associated with form elements via aria-describedby.
 */
export const InlineHelp: React.FC<InlineHelpProps> = ({
  id,
  title,
  content,
  collapsible = true,
  defaultCollapsed = true,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Toggle collapsed state
  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed)
    }
  }

  // Handle keyboard interaction (Enter or Space)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (collapsible && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      id={id}
      className={cn(
        'inline-help rounded-lg border-2 transition-all duration-300',
        'bg-blue-50 dark:bg-blue-900/20',
        'border-blue-200 dark:border-blue-800',
        className
      )}
      role="region"
      aria-label={title || 'Help information'}
    >
      {/* Header (clickable if collapsible) */}
      {collapsible ? (
        <button
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full flex items-center gap-3 p-3 text-left',
            'transition-colors duration-200',
            'hover:bg-blue-100/50 dark:hover:bg-blue-800/30',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'rounded-lg'
          )}
          aria-expanded={!isCollapsed}
          aria-controls={`${id}-content`}
        >
          {/* Icon */}
          <HelpCircle
            className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />

          {/* Title or default text */}
          <span className="flex-1 text-sm font-medium text-blue-900 dark:text-blue-100">
            {title || 'Help'}
          </span>

          {/* Expand/Collapse Icon */}
          {isCollapsed ? (
            <ChevronDown
              className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          ) : (
            <ChevronUp
              className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3 p-3">
          {/* Icon */}
          <HelpCircle
            className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />

          {/* Title (if provided for non-collapsible) */}
          {title && (
            <span className="flex-1 text-sm font-medium text-blue-900 dark:text-blue-100">
              {title}
            </span>
          )}
        </div>
      )}

      {/* Content (collapsible or always visible) */}
      {(!collapsible || !isCollapsed) && (
        <div
          id={`${id}-content`}
          className={cn(
            'px-3 pb-3',
            collapsible && 'pt-0',
            !collapsible && !title && 'pt-0',
            'animate-fade-in'
          )}
        >
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {content}
          </p>
        </div>
      )}

      {/* Screen reader announcement for collapsed state */}
      {collapsible && isCollapsed && (
        <span className="sr-only">
          {content}
        </span>
      )}
    </div>
  )
}

export default InlineHelp
