import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { checkBrowserCompatibility, BrowserCompatibility } from '@/utils/error-handling'

/**
 * Browser compatibility check component
 * Displays a warning if the browser doesn't support required features
 */
export default function BrowserCompatibilityCheck() {
  const [compatibility, setCompatibility] = useState<BrowserCompatibility | null>(null)

  useEffect(() => {
    const result = checkBrowserCompatibility()
    if (!result.supported) {
      setCompatibility(result)
    }
  }, [])

  if (!compatibility || compatibility.supported) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle>Browser Not Supported</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{compatibility.message}</p>
        <p className="text-sm">
          For the best experience, please use one of these browsers:
        </p>
        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
          <li>Chrome 90 or later</li>
          <li>Firefox 88 or later</li>
          <li>Safari 14 or later</li>
          <li>Edge 90 or later</li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
