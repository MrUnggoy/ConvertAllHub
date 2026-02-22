/**
 * ErrorDisplay Component
 * 
 * Clear, actionable error messages with recovery options.
 * Validates: Requirements 12.1, 12.2, 12.5
 * 
 * Features:
 * - Error, warning, and info severity levels
 * - Retry and dismiss functionality
 * - Collapsible technical details section
 * - Auto-dismiss for info messages (5s)
 * - User-friendly messages with suggested actions
 * - Accessible error announcements
 * 
 * @example
 * // Error with retry
 * <ErrorDisplay
 *   error={{
 *     code: 'NETWORK_ERROR',
 *     message: 'Network error occurred',
 *     userMessage: 'Unable to connect to the server',
 *     suggestedAction: 'Check your internet connection and try again',
 *     technicalDetails: 'Failed to fetch: net::ERR_INTERNET_DISCONNECTED'
 *   }}
 *   severity="error"
 *   onRetry={handleRetry}
 *   onDismiss={handleDismiss}
 * />
 * 
 * @example
 * // Info message with auto-dismiss
 * <ErrorDisplay
 *   error={{
 *     code: 'FILE_UPLOADED',
 *     message: 'File uploaded successfully',
 *     userMessage: 'Your file is ready for conversion',
 *     suggestedAction: 'Select an output format to continue'
 *   }}
 *   severity="info"
 *   onDismiss={handleDismiss}
 * />
 */

import React, { useState, useEffect } from 'react'
import { AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConversionError {
  /** Error code for tracking and debugging */
  code: string
  /** Technical error message */
  message: string
  /** User-friendly error message (Requirement 12.2) */
  userMessage: string
  /** Suggested action for the user (Requirement 12.2) */
  suggestedAction: string
  /** Optional technical details for debugging */
  technicalDetails?: string
}

export interface ErrorDisplayProps {
  /** Error object containing all error information */
  error: ConversionError
  /** Callback when user clicks retry button */
  onRetry?: () => void
  /** Callback when user dismisses the error */
  onDismiss?: () => void
  /** Severity level determines styling and behavior */
  severity: 'error' | 'warning' | 'info'
  /** Additional CSS classes */
  className?: string
}

/**
 * ErrorDisplay Component
 * 
 * Displays error, warning, or info messages with appropriate styling,
 * icons, and recovery options. Implements auto-dismiss for info messages.
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  severity,
  className,
}) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Auto-dismiss for info messages after 5 seconds
  useEffect(() => {
    if (severity === 'info' && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onDismiss()
        }, 300) // Wait for fade-out animation
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [severity, onDismiss])

  // Handle dismiss with animation
  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss?.()
    }, 300) // Wait for fade-out animation
  }

  // Severity-specific configuration
  const severityConfig = {
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-900 dark:text-red-100',
      accentColor: 'text-red-700 dark:text-red-300',
      buttonColor: 'bg-red-600 hover:bg-red-700 text-white',
      ariaLabel: 'Error',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-900 dark:text-amber-100',
      accentColor: 'text-amber-700 dark:text-amber-300',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      ariaLabel: 'Warning',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-900 dark:text-blue-100',
      accentColor: 'text-blue-700 dark:text-blue-300',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      ariaLabel: 'Information',
    },
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
        className
      )}
      role="alert"
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Severity Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon
            className={cn('h-6 w-6', config.iconColor)}
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User Message (Requirement 12.2) */}
          <h3 className={cn('font-semibold text-base mb-1', config.textColor)}>
            {error.userMessage}
          </h3>

          {/* Suggested Action (Requirement 12.2) */}
          <p className={cn('text-sm mb-3', config.accentColor)}>
            <strong>Suggested action:</strong> {error.suggestedAction}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Retry Button */}
            {onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                  'text-sm font-medium transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                  config.buttonColor
                )}
                aria-label="Retry operation"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            )}

            {/* Technical Details Toggle */}
            {error.technicalDetails && (
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-2 rounded-md',
                  'text-sm font-medium transition-colors duration-200',
                  'border-2',
                  config.borderColor,
                  config.accentColor,
                  'hover:bg-white/50 dark:hover:bg-black/20',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                )}
                aria-expanded={isDetailsExpanded}
                aria-controls="technical-details"
              >
                {isDetailsExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    Show Details
                  </>
                )}
              </button>
            )}
          </div>

          {/* Collapsible Technical Details */}
          {error.technicalDetails && isDetailsExpanded && (
            <div
              id="technical-details"
              className={cn(
                'mt-3 p-3 rounded-md',
                'bg-white/50 dark:bg-black/20',
                'border',
                config.borderColor,
                'animate-fade-in'
              )}
            >
              <h4 className={cn('text-xs font-semibold mb-2', config.accentColor)}>
                Technical Details:
              </h4>
              <pre
                className={cn(
                  'text-xs font-mono whitespace-pre-wrap break-words',
                  config.textColor,
                  'opacity-90'
                )}
              >
                {error.technicalDetails}
              </pre>
              <p className={cn('text-xs mt-2', config.accentColor, 'opacity-75')}>
                Error Code: {error.code}
              </p>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 p-1 rounded-md transition-colors duration-200',
              config.iconColor,
              'hover:bg-white/50 dark:hover:bg-black/20',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-white'
            )}
            aria-label="Dismiss message"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">
        {config.ariaLabel}: {error.userMessage}. {error.suggestedAction}
      </span>
    </div>
  )
}

export default ErrorDisplay
