/**
 * PrimaryCTA Component
 * 
 * A conversion-optimized call-to-action button with accessibility features.
 * Validates: Requirements 2.2, 2.4, 3.3, 3.4, 8.5, 11.4, 11.5
 * 
 * Features:
 * - Primary and secondary variants with gradient styling
 * - Loading, disabled, and icon support
 * - 44x44px minimum touch target size (Requirement 3.4)
 * - Hover, active, and focus states with proper contrast (Requirements 2.2, 8.5, 11.5)
 * - Visual distinction between variants (Requirement 2.4)
 * - Consistent styling (Requirement 11.4)
 */

import * as React from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PrimaryCTAProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button text content */
  text?: string
  /** Button variant - primary uses gradient, secondary uses outline */
  variant?: 'primary' | 'secondary'
  /** Button size - all sizes meet 44x44px minimum touch target */
  size?: 'small' | 'medium' | 'large'
  /** Optional icon to display before text */
  icon?: LucideIcon
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean
  /** Accessible label for screen readers */
  ariaLabel?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * PrimaryCTA - Conversion-optimized call-to-action button
 * 
 * @example
 * // Primary CTA with icon
 * <PrimaryCTA 
 *   text="Start Converting" 
 *   icon={Upload} 
 *   onClick={handleClick}
 *   ariaLabel="Start file conversion"
 * />
 * 
 * @example
 * // Secondary CTA with loading state
 * <PrimaryCTA 
 *   text="Processing..." 
 *   variant="secondary"
 *   loading={true}
 * />
 */
export const PrimaryCTA = React.forwardRef<HTMLButtonElement, PrimaryCTAProps>(
  (
    {
      text,
      children,
      variant = 'primary',
      size = 'medium',
      icon: Icon,
      loading = false,
      disabled = false,
      ariaLabel,
      className,
      ...props
    },
    ref
  ) => {
    // Base classes for all buttons
    const baseClasses = cn(
      // Layout and typography
      'inline-flex items-center justify-center gap-2',
      'font-semibold text-center',
      'rounded-lg',
      'transition-all duration-300 ease-out',
      
      // Accessibility - Focus state (Requirement 8.5)
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-primary-500',
      
      // Disabled state
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      
      // Touch optimization
      'touch-manipulation',
      'select-none'
    )

    // Size-specific classes (Requirement 3.4 - minimum 44x44px touch target)
    const sizeClasses = {
      small: cn(
        'min-h-[44px] min-w-[44px]', // Meets 44x44px minimum
        'px-4 py-2.5',
        'text-sm'
      ),
      medium: cn(
        'min-h-[48px] min-w-[48px]', // Exceeds minimum for better UX
        'px-6 py-3',
        'text-base'
      ),
      large: cn(
        'min-h-[56px] min-w-[56px]', // Large touch target
        'px-8 py-4',
        'text-lg'
      ),
    }

    // Variant-specific classes (Requirements 2.2, 2.4, 11.4, 11.5)
    const variantClasses = {
      primary: cn(
        // Gradient background (Requirement 11.4)
        'bg-gradient-to-r from-primary-500 to-secondary-500',
        'text-white',
        
        // Hover state - lift effect (Requirement 11.5)
        'hover:shadow-lg hover:-translate-y-0.5',
        'hover:from-primary-600 hover:to-secondary-600',
        
        // Active state - tactile feedback (Requirement 11.5)
        'active:scale-[0.98] active:translate-y-0',
        
        // High contrast for accessibility (Requirement 2.2)
        'shadow-md',
        
        // Visual distinction from secondary (Requirement 2.4)
        'font-bold'
      ),
      secondary: cn(
        // Outline style (Requirement 2.4 - visually distinct from primary)
        'bg-transparent',
        'border-2 border-primary-500',
        'text-primary-700',
        
        // Hover state (Requirement 11.5)
        'hover:bg-primary-50 hover:border-primary-600',
        'hover:shadow-md hover:-translate-y-0.5',
        
        // Active state (Requirement 11.5)
        'active:scale-[0.98] active:translate-y-0',
        'active:bg-primary-100',
        
        // Visual distinction from primary (Requirement 2.4)
        'font-semibold'
      ),
    }

    // Loading state classes
    const loadingClasses = loading ? 'cursor-wait' : ''

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          loadingClasses,
          className
        )}
        disabled={disabled || loading}
        aria-label={ariaLabel || (typeof text === 'string' ? text : undefined)}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 
            className="animate-spin" 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            aria-hidden="true"
          />
        )}
        
        {/* Icon */}
        {!loading && Icon && (
          <Icon 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
            aria-hidden="true"
          />
        )}
        
        {/* Button text or children */}
        {text || children}
      </button>
    )
  }
)

PrimaryCTA.displayName = 'PrimaryCTA'
