import { AlertCircle, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorNotificationProps {
  message: string
  onDismiss?: () => void
  onRetry?: () => void
  className?: string
}

/**
 * Dismissible error notification component
 * Displays user-friendly error messages with optional retry and dismiss actions
 */
export default function ErrorNotification({
  message,
  onDismiss,
  onRetry,
  className = '',
}: ErrorNotificationProps) {
  return (
    <Alert 
      variant="destructive" 
      className={`animate-fade-in ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
              aria-label="Retry the failed operation"
            >
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
              aria-label="Dismiss error message"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}
