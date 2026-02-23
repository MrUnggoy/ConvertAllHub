/**
 * ConversionFlow Component
 * 
 * Orchestrates the 3-step conversion process with state machine logic.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 8.4, 12.3, 12.4
 * 
 * Features:
 * - 3-step state machine: file selection, format selection, conversion
 * - Drag-drop and click upload for file selection
 * - Radio buttons/dropdown for format selection
 * - Progress indicator during conversion
 * - Inline validation with immediate feedback
 * - Error recovery without losing progress
 * - Keyboard navigation support
 * - Integrates StepIndicator and InlineHelp components
 * 
 * @example
 * <ConversionFlow
 *   toolId="pdf-converter"
 *   inputFormats={['pdf', 'docx']}
 *   outputFormats={['pdf', 'jpg', 'png']}
 *   onComplete={(result) => console.log('Conversion complete', result)}
 *   onError={(error) => console.error('Conversion error', error)}
 * />
 */

import React, { useState, useCallback, useRef } from 'react'
import { Upload, FileIcon, CheckCircle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import StepIndicator, { Step } from './StepIndicator'
import InlineHelp from './InlineHelp'
import ErrorDisplay, { ConversionError } from './ErrorDisplay'
import LoadingIndicator from './LoadingIndicator'
import { useConversion } from '@/contexts/ConversionContext'

export interface ConversionFlowProps {
  /** Tool identifier */
  toolId: string
  /** Supported input file formats */
  inputFormats: string[]
  /** Available output formats */
  outputFormats: string[]
  /** Callback when conversion completes successfully */
  onComplete: (result: ConversionFlowResult) => void
  /** Callback when an error occurs */
  onError: (error: ConversionError) => void
  /** Maximum file size in bytes (default: 50MB) */
  maxFileSize?: number
  /** Additional CSS classes */
  className?: string
}

export interface ConversionFlowResult {
  file: Blob
  filename: string
  size: number
  downloadUrl: string
}

export interface FormatOption {
  id: string
  name: string
  extension: string
  description: string
}

type ConversionStep = 1 | 2 | 3

interface ConversionFlowState {
  currentStep: ConversionStep
  selectedFile: File | null
  selectedFormat: string | null
  isConverting: boolean
  progress: number
  error: ConversionError | null
  result: ConversionFlowResult | null
}

/**
 * ConversionFlow Component
 * 
 * Manages the complete conversion workflow from file selection to download.
 * Implements a 3-step state machine with validation and error recovery.
 */
export const ConversionFlow: React.FC<ConversionFlowProps> = ({
  toolId,
  inputFormats,
  outputFormats,
  onComplete,
  onError,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  className,
}) => {
  // State management
  const [state, setState] = useState<ConversionFlowState>({
    currentStep: 1,
    selectedFile: null,
    selectedFormat: null,
    isConverting: false,
    progress: 0,
    error: null,
    result: null,
  })

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false)

  // Conversion context
  const { addFile } = useConversion()

  // Step configuration
  const steps: Step[] = [
    { number: 1, title: 'Select File', description: 'Upload your file' },
    { number: 2, title: 'Choose Format', description: 'Pick output format' },
    { number: 3, title: 'Convert', description: 'Process and download' },
  ]

  // Format options
  const formatOptions: FormatOption[] = outputFormats.map(format => ({
    id: format.toLowerCase(),
    name: format.toUpperCase(),
    extension: format.toLowerCase(),
    description: `Convert to ${format.toUpperCase()} format`,
  }))

  // Validation functions
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`,
      }
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const isValidFormat = inputFormats.some(format => 
      format.toLowerCase() === fileExtension
    )

    if (!isValidFormat) {
      return {
        isValid: false,
        error: `File type not supported. Supported formats: ${inputFormats.join(', ')}`,
      }
    }

    return { isValid: true }
  }, [inputFormats, maxFileSize])

  // File selection handlers
  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file)
    
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'INVALID_FILE',
          message: validation.error || 'Invalid file',
          userMessage: 'File validation failed',
          suggestedAction: validation.error || 'Please select a valid file',
        },
      }))
      return
    }

    // Clear any previous errors
    setState(prev => ({
      ...prev,
      selectedFile: file,
      error: null,
    }))
  }, [validateFile])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // Touch gesture handlers for mobile support
  const handleTouchStart = useCallback(() => {
    // Provide visual feedback on touch
    setIsDragOver(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    // Remove visual feedback
    setIsDragOver(false)
    
    // Trigger file input on touch end (same as click)
    handleDropZoneClick()
  }, [handleDropZoneClick])

  // Keyboard navigation for drop zone
  const handleDropZoneKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDropZoneClick()
    }
  }, [handleDropZoneClick])

  // Step 1: Proceed to format selection
  const handleProceedToFormatSelection = useCallback(() => {
    if (!state.selectedFile) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'NO_FILE',
          message: 'No file selected',
          userMessage: 'Please select a file first',
          suggestedAction: 'Click the upload area or drag and drop a file',
        },
      }))
      return
    }

    setState(prev => ({
      ...prev,
      currentStep: 2,
      error: null,
    }))
  }, [state.selectedFile])

  // Step 2: Format selection
  const handleFormatSelect = useCallback((formatId: string) => {
    setState(prev => ({
      ...prev,
      selectedFormat: formatId,
      error: null,
    }))
  }, [])

  // Step 2: Proceed to conversion
  const handleProceedToConversion = useCallback(() => {
    if (!state.selectedFormat) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'NO_FORMAT',
          message: 'No format selected',
          userMessage: 'Please select an output format',
          suggestedAction: 'Choose one of the available formats above',
        },
      }))
      return
    }

    setState(prev => ({
      ...prev,
      currentStep: 3,
      error: null,
    }))
  }, [state.selectedFormat])

  // Step 3: Start conversion
  const handleStartConversion = useCallback(async () => {
    if (!state.selectedFile || !state.selectedFormat) {
      return
    }

    setState(prev => ({
      ...prev,
      isConverting: true,
      progress: 0,
      error: null,
    }))

    try {
      // Add file to conversion context
      addFile(state.selectedFile, toolId)

      // Simulate conversion progress (replace with actual conversion logic)
      const progressInterval = setInterval(() => {
        setState(prev => {
          const newProgress = Math.min(prev.progress + 10, 90)
          return { ...prev, progress: newProgress }
        })
      }, 300)

      // Simulate conversion (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 3000))

      clearInterval(progressInterval)

      // Mock result (replace with actual conversion result)
      const result: ConversionFlowResult = {
        file: new Blob([state.selectedFile], { type: 'application/octet-stream' }),
        filename: `converted.${state.selectedFormat}`,
        size: state.selectedFile.size,
        downloadUrl: URL.createObjectURL(state.selectedFile),
      }

      setState(prev => ({
        ...prev,
        isConverting: false,
        progress: 100,
        result,
      }))

      onComplete(result)
    } catch (error) {
      const conversionError: ConversionError = {
        code: 'CONVERSION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        userMessage: 'Conversion failed',
        suggestedAction: 'Please try again or contact support if the problem persists',
        technicalDetails: error instanceof Error ? error.stack : undefined,
      }

      setState(prev => ({
        ...prev,
        isConverting: false,
        error: conversionError,
      }))

      onError(conversionError)
    }
  }, [state.selectedFile, state.selectedFormat, toolId, addFile, onComplete, onError])

  // Error recovery: Retry conversion
  const handleRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      progress: 0,
    }))
    handleStartConversion()
  }, [handleStartConversion])

  // Error recovery: Go back to previous step
  const handleGoBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as ConversionStep,
      error: null,
    }))
  }, [])

  // Error recovery: Start over
  const handleStartOver = useCallback(() => {
    setState({
      currentStep: 1,
      selectedFile: null,
      selectedFormat: null,
      isConverting: false,
      progress: 0,
      error: null,
      result: null,
    })
  }, [])

  // Dismiss error
  const handleDismissError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  // Download result
  const handleDownload = useCallback(() => {
    if (!state.result) return

    const link = document.createElement('a')
    link.href = state.result.downloadUrl
    link.download = state.result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [state.result])

  return (
    <div className={cn('conversion-flow w-full max-w-4xl mx-auto', className)}>
      {/* Step Indicator */}
      <StepIndicator
        currentStep={state.currentStep}
        totalSteps={3}
        steps={steps}
        className="mb-8"
      />

      {/* Error Display */}
      {state.error && (
        <ErrorDisplay
          error={state.error}
          severity="error"
          onRetry={state.currentStep === 3 ? handleRetry : undefined}
          onDismiss={handleDismissError}
          className="mb-6"
        />
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: File Selection */}
        {state.currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Select Your File</h2>
            
            <InlineHelp
              id="file-selection-help"
              title="How to upload"
              content={`Click the upload area or drag and drop your file. Supported formats: ${inputFormats.join(', ')}. Maximum file size: ${(maxFileSize / 1024 / 1024).toFixed(0)}MB.`}
              defaultCollapsed={false}
              className="mb-4"
            />

            {/* File Upload Drop Zone */}
            <div
              ref={dropZoneRef}
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isDragOver
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-neutral-300 hover:border-primary/50 hover:bg-accent/50',
                state.selectedFile && 'border-green-500 bg-green-50'
              )}
              style={{ touchAction: 'manipulation' }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onKeyDown={handleDropZoneKeyDown}
              role="button"
              tabIndex={0}
              aria-label={`Upload ${inputFormats.join(', ')} files. Drop files here or press Enter to browse.`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={inputFormats.map(f => `.${f.toLowerCase()}`).join(',')}
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="File input"
              />

              {state.selectedFile ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" aria-hidden="true" />
                  <div>
                    <p className="text-lg font-semibold text-green-700">File Selected</p>
                    <p className="text-sm text-neutral-600 mt-2">{state.selectedFile.name}</p>
                    <p className="text-xs text-neutral-500">
                      {(state.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <p className="text-sm text-neutral-600">Click to select a different file</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-16 w-16 mx-auto text-neutral-400" aria-hidden="true" />
                  <div>
                    <p className="text-lg font-semibold">
                      {isDragOver ? 'Drop file here' : 'Drop file here or click to browse'}
                    </p>
                    <p className="text-sm text-neutral-600 mt-2">
                      Supports: {inputFormats.join(', ')}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={handleProceedToFormatSelection}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  state.selectedFile
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                )}
                style={{ touchAction: 'manipulation' }}
                aria-label="Proceed to format selection"
              >
                Next: Choose Format
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Format Selection */}
        {state.currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Choose Output Format</h2>
            
            <InlineHelp
              id="format-selection-help"
              title="Select format"
              content="Choose the format you want to convert your file to. Each format has different characteristics and use cases."
              defaultCollapsed={false}
              className="mb-4"
            />

            {/* Format Options */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
              role="radiogroup"
              aria-label="Output format selection"
            >
              {formatOptions.map(format => (
                <button
                  key={format.id}
                  onClick={() => handleFormatSelect(format.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFormatSelect(format.id)
                    }
                  }}
                  className={cn(
                    'p-6 rounded-lg border-2 transition-all duration-200 text-left',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    state.selectedFormat === format.id
                      ? 'border-primary bg-primary/10 shadow-md scale-105'
                      : 'border-neutral-300 hover:border-primary/50 hover:bg-accent/50'
                  )}
                  style={{ touchAction: 'manipulation' }}
                  role="radio"
                  aria-checked={state.selectedFormat === format.id}
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileIcon className="h-8 w-8 text-primary" aria-hidden="true" />
                    {state.selectedFormat === format.id && (
                      <CheckCircle className="h-6 w-6 text-primary" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{format.name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{format.description}</p>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleGoBack}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold border-2 border-neutral-300 transition-all duration-200',
                  'hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-primary focus-visible:ring-offset-2'
                )}
                style={{ touchAction: 'manipulation' }}
                aria-label="Go back to file selection"
              >
                Back
              </button>
              <button
                onClick={handleProceedToConversion}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  state.selectedFormat
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                )}
                style={{ touchAction: 'manipulation' }}
                aria-label="Proceed to conversion"
              >
                Next: Convert
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Conversion */}
        {state.currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Convert Your File</h2>
            
            {!state.isConverting && !state.result && (
              <InlineHelp
                id="conversion-help"
                title="Ready to convert"
                content="Click the button below to start the conversion process. Your file will be processed securely and you'll be able to download the result."
                defaultCollapsed={false}
                className="mb-4"
              />
            )}

            {/* Conversion Summary */}
            <div className="bg-accent/50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">File:</span>
                <span className="text-neutral-700">{state.selectedFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Output Format:</span>
                <span className="text-neutral-700">{state.selectedFormat?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">File Size:</span>
                <span className="text-neutral-700">
                  {state.selectedFile ? (state.selectedFile.size / 1024 / 1024).toFixed(2) : '0'} MB
                </span>
              </div>
            </div>

            {/* Conversion Progress */}
            {state.isConverting && (
              <LoadingIndicator
                type="progress"
                progress={state.progress}
                message="Converting your file..."
                size="large"
                delay={0}
              />
            )}

            {/* Conversion Complete */}
            {state.result && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center space-y-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" aria-hidden="true" />
                <div>
                  <h3 className="text-xl font-bold text-green-700">Conversion Complete!</h3>
                  <p className="text-sm text-green-600 mt-2">
                    Your file has been successfully converted
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className={cn(
                    'px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200',
                    'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
                    'inline-flex items-center gap-2'
                  )}
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Download converted file"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Download File
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {!state.isConverting && !state.result && (
              <div className="flex justify-between">
                <button
                  onClick={handleGoBack}
                  className={cn(
                    'px-6 py-3 rounded-lg font-semibold border-2 border-neutral-300 transition-all duration-200',
                    'hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Go back to format selection"
                >
                  Back
                </button>
                <button
                  onClick={handleStartConversion}
                  className={cn(
                    'px-8 py-4 rounded-lg font-semibold text-white transition-all duration-200',
                    'bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg hover:-translate-y-0.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Start conversion"
                >
                  Start Conversion
                </button>
              </div>
            )}

            {/* Start Over Button (after completion) */}
            {state.result && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleStartOver}
                  className={cn(
                    'px-6 py-3 rounded-lg font-semibold border-2 border-neutral-300 transition-all duration-200',
                    'hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                  style={{ touchAction: 'manipulation' }}
                  aria-label="Start a new conversion"
                >
                  Convert Another File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversionFlow
