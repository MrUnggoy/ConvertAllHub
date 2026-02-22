/**
 * ErrorDisplay Component Examples
 * 
 * Demonstrates various use cases for the ErrorDisplay component
 * including different severity levels, with/without retry, and
 * technical details.
 */

import { useState } from 'react'
import ErrorDisplay, { ConversionError } from './ErrorDisplay'

export default function ErrorDisplayExamples() {
  const [showError, setShowError] = useState(true)
  const [showWarning, setShowWarning] = useState(true)
  const [showInfo, setShowInfo] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Example: File type not supported (Requirement 12.1)
  const fileTypeError: ConversionError = {
    code: 'INVALID_FORMAT',
    message: 'Unsupported file type: .xyz',
    userMessage: 'This file type is not supported',
    suggestedAction: 'Please use one of these formats: PDF, DOCX, TXT, JPG, PNG, GIF, BMP, TIFF',
    technicalDetails: 'File extension ".xyz" is not in the allowed formats list. MIME type: application/octet-stream',
  }

  // Example: Network error with retry (Requirement 12.4)
  const networkError: ConversionError = {
    code: 'NETWORK_ERROR',
    message: 'Failed to fetch',
    userMessage: 'Unable to connect to the server',
    suggestedAction: 'Check your internet connection and try again',
    technicalDetails: `Network request failed: net::ERR_INTERNET_DISCONNECTED\nRetry attempt: ${retryCount}`,
  }

  // Example: Conversion failed (Requirement 12.2)
  const conversionError: ConversionError = {
    code: 'CONVERSION_FAILED',
    message: 'Conversion process failed',
    userMessage: 'We couldn\'t convert your file',
    suggestedAction: 'The file might be corrupted. Try a different file or contact support if the problem persists',
    technicalDetails: 'Error in conversion pipeline at stage 2: Invalid PDF structure\nStack trace: at convertPDF (converter.ts:142)\nat processFile (processor.ts:89)',
  }

  // Example: File too large warning
  const fileSizeWarning: ConversionError = {
    code: 'FILE_TOO_LARGE',
    message: 'File size exceeds limit',
    userMessage: 'Your file is larger than the recommended size',
    suggestedAction: 'Files over 10MB may take longer to process. Consider compressing your file first',
    technicalDetails: 'File size: 15.3 MB, Recommended max: 10 MB',
  }

  // Example: Success info message (auto-dismisses after 5s)
  const successInfo: ConversionError = {
    code: 'FILE_UPLOADED',
    message: 'File uploaded successfully',
    userMessage: 'Your file is ready for conversion',
    suggestedAction: 'Select an output format to continue',
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    console.log('Retry clicked, count:', retryCount + 1)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">ErrorDisplay Component Examples</h1>
        <p className="text-gray-600">
          Demonstrates error, warning, and info messages with various features
        </p>
      </div>

      {/* Error Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Error Severity</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">File Type Not Supported (Requirement 12.1)</h3>
            {showError && (
              <ErrorDisplay
                error={fileTypeError}
                severity="error"
                onRetry={() => {
                  console.log('Retry file selection')
                  setShowError(false)
                  setTimeout(() => setShowError(true), 1000)
                }}
                onDismiss={() => setShowError(false)}
              />
            )}
            {!showError && (
              <button
                onClick={() => setShowError(true)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Show Error
              </button>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Network Error with Retry (Requirement 12.4)</h3>
            <ErrorDisplay
              error={networkError}
              severity="error"
              onRetry={handleRetry}
              onDismiss={() => console.log('Dismissed network error')}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Conversion Failed (Requirement 12.2)</h3>
            <ErrorDisplay
              error={conversionError}
              severity="error"
              onDismiss={() => console.log('Dismissed conversion error')}
            />
          </div>
        </div>
      </section>

      {/* Warning Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Warning Severity</h2>
        
        <div>
          <h3 className="text-lg font-medium mb-2">File Size Warning</h3>
          {showWarning && (
            <ErrorDisplay
              error={fileSizeWarning}
              severity="warning"
              onDismiss={() => setShowWarning(false)}
            />
          )}
          {!showWarning && (
            <button
              onClick={() => setShowWarning(true)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Show Warning
            </button>
          )}
        </div>
      </section>

      {/* Info Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Info Severity (Auto-dismisses after 5s)</h2>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Success Message</h3>
          {showInfo && (
            <ErrorDisplay
              error={successInfo}
              severity="info"
              onDismiss={() => setShowInfo(false)}
            />
          )}
          {!showInfo && (
            <button
              onClick={() => setShowInfo(true)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Show Info (will auto-dismiss in 5s)
            </button>
          )}
        </div>
      </section>

      {/* Without Dismiss Button */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Without Dismiss Button</h2>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Critical Error (Cannot be dismissed)</h3>
          <ErrorDisplay
            error={{
              code: 'CRITICAL_ERROR',
              message: 'Critical system error',
              userMessage: 'A critical error has occurred',
              suggestedAction: 'Please refresh the page or contact support',
              technicalDetails: 'System error: Memory allocation failed',
            }}
            severity="error"
            onRetry={() => window.location.reload()}
          />
        </div>
      </section>

      {/* Without Technical Details */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Without Technical Details</h2>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Simple Error Message</h3>
          <ErrorDisplay
            error={{
              code: 'SIMPLE_ERROR',
              message: 'Simple error',
              userMessage: 'Something went wrong',
              suggestedAction: 'Please try again',
            }}
            severity="error"
            onRetry={() => console.log('Retry')}
            onDismiss={() => console.log('Dismiss')}
          />
        </div>
      </section>

      {/* Stacked Errors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Multiple Errors</h2>
        
        <div className="space-y-3">
          <ErrorDisplay
            error={{
              code: 'ERROR_1',
              message: 'First error',
              userMessage: 'First error occurred',
              suggestedAction: 'Fix the first issue',
            }}
            severity="error"
            onDismiss={() => console.log('Dismiss error 1')}
          />
          <ErrorDisplay
            error={{
              code: 'WARNING_1',
              message: 'Warning message',
              userMessage: 'This is a warning',
              suggestedAction: 'Be aware of this issue',
            }}
            severity="warning"
            onDismiss={() => console.log('Dismiss warning 1')}
          />
          <ErrorDisplay
            error={{
              code: 'INFO_1',
              message: 'Info message',
              userMessage: 'This is informational',
              suggestedAction: 'No action needed',
            }}
            severity="info"
            onDismiss={() => console.log('Dismiss info 1')}
          />
        </div>
      </section>
    </div>
  )
}
