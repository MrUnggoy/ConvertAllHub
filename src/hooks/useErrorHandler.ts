import { useState, useCallback } from 'react'
import { getUserFriendlyErrorMessage, logError } from '@/utils/error-handling'

interface UseErrorHandlerReturn {
  error: string | null
  setError: (error: string | null) => void
  handleError: (error: unknown, context: string, fileName?: string, fileSize?: number) => void
  clearError: () => void
}

/**
 * Hook for consistent error handling across tools
 * Provides error state management and user-friendly error messages
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback(
    (error: unknown, context: string, fileName?: string, fileSize?: number) => {
      // Log the error to console
      logError(error, context, fileName, fileSize)

      // Set user-friendly error message
      const message = getUserFriendlyErrorMessage(error, context)
      setError(message)
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    setError,
    handleError,
    clearError,
  }
}
