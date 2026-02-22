/**
 * LoadingIndicator Component
 * 
 * Provides feedback during loading states with three types:
 * - Spinner: For indeterminate loading (< 1s expected)
 * - Skeleton: For content loading (shows layout structure)
 * - Progress: For determinate operations (file conversion)
 * 
 * Features:
 * - 1-second delay before display to prevent flash (Requirement 9.5)
 * - Accessible loading announcements for screen readers (Requirement 8.2)
 * - Smooth fade-in animation
 * - Multiple size options
 * 
 * Validates: Requirements 9.5 (Loading indicator timing)
 */

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingIndicatorProps {
  /** Type of loading indicator to display */
  type: 'spinner' | 'skeleton' | 'progress'
  /** Size of the indicator */
  size?: 'small' | 'medium' | 'large'
  /** Progress percentage (0-100) for progress type */
  progress?: number
  /** Optional message to display */
  message?: string
  /** Additional CSS classes */
  className?: string
  /** Delay in milliseconds before showing indicator (default: 1000ms) */
  delay?: number
}

/**
 * LoadingIndicator Component
 * 
 * Displays loading feedback with configurable types, sizes, and delay.
 * Implements 1-second delay to prevent flash for fast operations.
 * 
 * @example
 * // Spinner for quick operations
 * <LoadingIndicator type="spinner" size="medium" message="Loading..." />
 * 
 * @example
 * // Progress bar for file conversion
 * <LoadingIndicator type="progress" progress={45} message="Converting..." />
 * 
 * @example
 * // Skeleton for content loading
 * <LoadingIndicator type="skeleton" size="large" />
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type,
  size = 'medium',
  progress = 0,
  message,
  className = '',
  delay = 1000,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  // Implement 1-second delay before display (Requirement 9.5)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  // Don't render anything until delay has passed
  if (!isVisible) {
    return null
  }

  // Size classes for different indicator types
  const spinnerSizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  }

  const skeletonSizeClasses = {
    small: 'h-20',
    medium: 'h-40',
    large: 'h-60',
  }

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  // Render spinner type
  if (type === 'spinner') {
    return (
      <div
        className={`flex flex-col items-center justify-center space-y-4 animate-fade-in ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2
          className={`animate-spin text-primary ${spinnerSizeClasses[size]}`}
          aria-hidden="true"
        />
        {message && (
          <p className="text-body-sm text-secondary text-center">
            {message}
          </p>
        )}
        <span className="sr-only">
          {message || 'Loading, please wait...'}
        </span>
      </div>
    )
  }

  // Render skeleton type
  if (type === 'skeleton') {
    return (
      <div
        className={`animate-fade-in ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className={`w-full ${skeletonSizeClasses[size]} space-y-4`}>
          {/* Skeleton header */}
          <div className="h-8 w-3/4 loading-skeleton rounded" />
          
          {/* Skeleton content lines */}
          <div className="space-y-3">
            <div className="h-4 w-full loading-skeleton rounded" />
            <div className="h-4 w-5/6 loading-skeleton rounded" />
            <div className="h-4 w-4/6 loading-skeleton rounded" />
          </div>
          
          {/* Skeleton footer */}
          {size !== 'small' && (
            <div className="h-10 w-32 loading-skeleton rounded" />
          )}
        </div>
        {message && (
          <p className="text-body-sm text-secondary mt-4 text-center">
            {message}
          </p>
        )}
        <span className="sr-only">
          {message || 'Loading content, please wait...'}
        </span>
      </div>
    )
  }

  // Render progress type
  if (type === 'progress') {
    return (
      <div
        className={`flex flex-col items-center justify-center space-y-4 animate-fade-in ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Progress bar container */}
        <div className="w-full max-w-md">
          <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
            {/* Progress bar fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-primary transition-all duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
              aria-hidden="true"
            />
          </div>
          
          {/* Progress percentage */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-body-sm text-secondary">
              {message || 'Processing...'}
            </span>
            <span className="text-body-sm font-semibold text-primary">
              {clampedProgress}%
            </span>
          </div>
        </div>
        
        <span className="sr-only">
          {message || 'Processing'}, {clampedProgress} percent complete
        </span>
      </div>
    )
  }

  return null
}

export default LoadingIndicator
