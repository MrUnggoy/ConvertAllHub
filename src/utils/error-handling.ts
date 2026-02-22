/**
 * Error handling utilities for ConvertAll Hub
 * Provides file validation, user-friendly error messages, and error logging
 */

// Error types
export enum FileValidationError {
  INVALID_FORMAT = 'INVALID_FORMAT',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  EMPTY_FILE = 'EMPTY_FILE',
}

export enum ProcessingError {
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  INSUFFICIENT_MEMORY = 'INSUFFICIENT_MEMORY',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED',
}

export interface ValidationResult {
  valid: boolean
  error?: FileValidationError
  message?: string
}

export interface ErrorLog {
  timestamp: Date
  errorType: string
  errorMessage: string
  fileName?: string
  fileSize?: number
  browserInfo: string
  stackTrace?: string
}

/**
 * Validate file format against allowed formats
 */
export function validateFileFormat(file: File, allowedFormats: string[]): ValidationResult {
  if (!file || file.size === 0) {
    return {
      valid: false,
      error: FileValidationError.EMPTY_FILE,
      message: 'The selected file is empty. Please choose a valid file.',
    }
  }

  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const mimeType = file.type.toLowerCase()

  // Check both MIME type and extension
  const isValidMimeType = allowedFormats.some(format => 
    mimeType.includes(format.toLowerCase().replace('.', ''))
  )
  
  const isValidExtension = allowedFormats.some(format => 
    format.toLowerCase().replace('.', '') === fileExtension
  )

  if (!isValidMimeType && !isValidExtension) {
    return {
      valid: false,
      error: FileValidationError.INVALID_FORMAT,
      message: `Unsupported format. Supported formats: ${allowedFormats.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(file: File, maxSizeBytes: number): ValidationResult {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    
    return {
      valid: false,
      error: FileValidationError.FILE_TOO_LARGE,
      message: `File too large (${fileSizeMB} MB). Maximum size: ${maxSizeMB} MB`,
    }
  }

  return { valid: true }
}

/**
 * Comprehensive file validation
 */
export function validateFile(
  file: File,
  allowedFormats: string[],
  maxSizeBytes: number
): ValidationResult {
  // Check format first
  const formatValidation = validateFileFormat(file, allowedFormats)
  if (!formatValidation.valid) {
    return formatValidation
  }

  // Then check size
  const sizeValidation = validateFileSize(file, maxSizeBytes)
  if (!sizeValidation.valid) {
    return sizeValidation
  }

  return { valid: true }
}

/**
 * Generate user-friendly error messages
 */
export function getUserFriendlyErrorMessage(error: unknown, context?: string): string {
  if (error instanceof Error) {
    // Map common error patterns to user-friendly messages
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }

    if (message.includes('memory') || message.includes('out of memory')) {
      return 'Not enough memory to process this file. Try a smaller file or close other tabs.'
    }

    if (message.includes('timeout')) {
      return 'The operation took too long. Please try again with a smaller file.'
    }

    if (message.includes('corrupt') || message.includes('invalid')) {
      return 'This file appears to be corrupted or invalid. Please try a different file.'
    }

    if (message.includes('permission')) {
      return 'Permission denied. Please check your browser settings.'
    }

    // Return the original error message if it's already user-friendly
    if (error.message.length < 100 && !message.includes('undefined')) {
      return error.message
    }
  }

  // Generic fallback message
  const operation = context ? ` ${context}` : ''
  return `Conversion failed${operation}. Please try again or use a different file.`
}

/**
 * Log error to console with context
 */
export function logError(
  error: unknown,
  context: string,
  fileName?: string,
  fileSize?: number
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date(),
    errorType: error instanceof Error ? error.name : 'Unknown',
    errorMessage: error instanceof Error ? error.message : String(error),
    fileName,
    fileSize,
    browserInfo: navigator.userAgent,
    stackTrace: error instanceof Error ? error.stack : undefined,
  }

  console.error(`[${context}] Error:`, errorLog)
}

/**
 * Check browser compatibility for required features
 */
export interface BrowserCompatibility {
  supported: boolean
  missingFeatures: string[]
  message: string
}

export function checkBrowserCompatibility(): BrowserCompatibility {
  const missingFeatures: string[] = []

  // Check for File API
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    missingFeatures.push('File API')
  }

  // Check for Canvas API
  if (!document.createElement('canvas').getContext) {
    missingFeatures.push('Canvas API')
  }

  // Check for URL.createObjectURL
  if (!window.URL || !window.URL.createObjectURL) {
    missingFeatures.push('URL API')
  }

  // Check for Promise support
  if (!window.Promise) {
    missingFeatures.push('Promise API')
  }

  // Check for async/await support (ES2017)
  try {
    eval('(async () => {})')
  } catch {
    missingFeatures.push('Async/Await')
  }

  const supported = missingFeatures.length === 0

  return {
    supported,
    missingFeatures,
    message: supported
      ? 'Your browser supports all required features.'
      : `Your browser doesn't support: ${missingFeatures.join(', ')}. Please use Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+.`,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
